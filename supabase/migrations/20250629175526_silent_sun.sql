/*
  # Permanent Points Synchronization Fix

  1. Problem Analysis
    - Points are not being properly synchronized between point_transactions and profiles
    - The trigger system may not be working correctly
    - Users are not seeing their earned points reflected in their balance

  2. Solution
    - Create a robust point synchronization system
    - Add a manual sync function that can be called anytime
    - Ensure all existing data is properly synchronized
    - Add better error handling and logging

  3. Implementation
    - Drop and recreate all point-related functions
    - Create a comprehensive sync function
    - Add a trigger that actually works
    - Manually sync all existing data
*/

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_point_transaction_created ON point_transactions;
DROP FUNCTION IF EXISTS handle_point_transaction();
DROP FUNCTION IF EXISTS increment_user_points(uuid, integer);

-- Create a comprehensive point synchronization function
CREATE OR REPLACE FUNCTION sync_user_points(target_user_id uuid DEFAULT NULL)
RETURNS TABLE(user_id uuid, old_points integer, new_points integer, transaction_total integer) AS $$
DECLARE
  user_record RECORD;
  calculated_points integer;
  old_points integer;
  new_level integer;
BEGIN
  -- If target_user_id is provided, sync only that user, otherwise sync all users
  FOR user_record IN 
    SELECT p.id, p.email, p.points as current_points, p.level
    FROM profiles p
    WHERE (target_user_id IS NULL OR p.id = target_user_id)
  LOOP
    -- Calculate total points from all transactions for this user
    SELECT COALESCE(SUM(points), 0) INTO calculated_points
    FROM point_transactions 
    WHERE point_transactions.user_id = user_record.id;
    
    -- Store old points for return
    old_points := user_record.current_points;
    
    -- Calculate new level based on points
    new_level := CASE 
      WHEN calculated_points >= 1000 THEN 10
      WHEN calculated_points >= 900 THEN 9
      WHEN calculated_points >= 800 THEN 8
      WHEN calculated_points >= 700 THEN 7
      WHEN calculated_points >= 600 THEN 6
      WHEN calculated_points >= 500 THEN 5
      WHEN calculated_points >= 400 THEN 4
      WHEN calculated_points >= 300 THEN 3
      WHEN calculated_points >= 200 THEN 2
      ELSE 1
    END;
    
    -- Update the user's points and level
    UPDATE profiles 
    SET 
      points = calculated_points,
      level = new_level,
      updated_at = now()
    WHERE id = user_record.id;
    
    -- Return the sync result
    RETURN QUERY SELECT user_record.id, old_points, calculated_points, calculated_points;
    
    -- Log the sync operation
    RAISE NOTICE 'Synced user % (%): % -> % points (level %)', 
      user_record.email, user_record.id, old_points, calculated_points, new_level;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simple increment function that uses the sync function
CREATE OR REPLACE FUNCTION increment_user_points(target_user_id uuid, points_to_add integer)
RETURNS boolean AS $$
DECLARE
  sync_result RECORD;
BEGIN
  -- First, add the point transaction (this should already be done by the caller)
  -- We just need to sync the user's points
  
  -- Sync this specific user's points
  SELECT * INTO sync_result FROM sync_user_points(target_user_id) LIMIT 1;
  
  IF sync_result.user_id IS NOT NULL THEN
    RAISE NOTICE 'Points updated for user %: % -> %', 
      target_user_id, sync_result.old_points, sync_result.new_points;
    RETURN true;
  ELSE
    RAISE NOTICE 'Failed to sync points for user %', target_user_id;
    RETURN false;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in increment_user_points: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function that calls the sync function
CREATE OR REPLACE FUNCTION handle_point_transaction()
RETURNS trigger AS $$
DECLARE
  sync_result RECORD;
BEGIN
  RAISE NOTICE 'Point transaction trigger fired: % points for user %', NEW.points, NEW.user_id;
  
  -- Sync the user's points after any transaction
  SELECT * INTO sync_result FROM sync_user_points(NEW.user_id) LIMIT 1;
  
  IF sync_result.user_id IS NOT NULL THEN
    RAISE NOTICE 'Trigger sync successful: user % now has % points', 
      NEW.user_id, sync_result.new_points;
  ELSE
    RAISE NOTICE 'Trigger sync failed for user %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_point_transaction_created
  AFTER INSERT ON point_transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_point_transaction();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION sync_user_points(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_user_points(uuid, integer) TO authenticated;

-- Now sync ALL existing users to fix current state
DO $$
DECLARE
  sync_results RECORD;
  total_users_synced integer := 0;
BEGIN
  RAISE NOTICE 'Starting comprehensive point synchronization for all users...';
  
  -- Sync all users and count results
  FOR sync_results IN 
    SELECT * FROM sync_user_points()
  LOOP
    total_users_synced := total_users_synced + 1;
  END LOOP;
  
  RAISE NOTICE 'Point synchronization completed. Total users synced: %', total_users_synced;
END $$;

-- Create a function to manually trigger point sync (useful for debugging)
CREATE OR REPLACE FUNCTION manual_point_sync()
RETURNS TABLE(user_email text, old_points integer, new_points integer, difference integer) AS $$
DECLARE
  sync_results RECORD;
BEGIN
  RAISE NOTICE 'Manual point synchronization requested...';
  
  RETURN QUERY
  SELECT 
    p.email,
    s.old_points,
    s.new_points,
    (s.new_points - s.old_points) as difference
  FROM sync_user_points() s
  JOIN profiles p ON p.id = s.user_id
  ORDER BY p.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION manual_point_sync() TO authenticated;

-- Test the system with the demo user
DO $$
DECLARE
  demo_user_id uuid;
  demo_email text;
  before_points integer;
  after_points integer;
  transaction_total integer;
BEGIN
  -- Find demo user
  SELECT id, email, points INTO demo_user_id, demo_email, before_points
  FROM profiles 
  WHERE email = 'employee@demo.com';
  
  IF demo_user_id IS NOT NULL THEN
    RAISE NOTICE 'Testing with demo user: % (%) - Current points: %', 
      demo_email, demo_user_id, before_points;
    
    -- Get transaction total
    SELECT COALESCE(SUM(points), 0) INTO transaction_total
    FROM point_transactions 
    WHERE user_id = demo_user_id;
    
    RAISE NOTICE 'Transaction total for demo user: %', transaction_total;
    
    -- Force sync
    PERFORM sync_user_points(demo_user_id);
    
    -- Check result
    SELECT points INTO after_points FROM profiles WHERE id = demo_user_id;
    
    RAISE NOTICE 'Demo user sync result: % -> % points', before_points, after_points;
    
    IF after_points = transaction_total THEN
      RAISE NOTICE 'SUCCESS: Demo user points are now correctly synchronized!';
    ELSE
      RAISE NOTICE 'WARNING: Demo user points still not matching transactions';
    END IF;
  ELSE
    RAISE NOTICE 'Demo user not found';
  END IF;
END $$;

-- Final verification for all users
DO $$
DECLARE
  user_record RECORD;
  mismatch_count integer := 0;
  total_users integer := 0;
BEGIN
  RAISE NOTICE 'Final verification of point synchronization...';
  
  FOR user_record IN
    SELECT 
      p.id,
      p.email,
      p.points as profile_points,
      COALESCE(SUM(pt.points), 0) as transaction_points
    FROM profiles p
    LEFT JOIN point_transactions pt ON pt.user_id = p.id
    GROUP BY p.id, p.email, p.points
  LOOP
    total_users := total_users + 1;
    
    IF user_record.profile_points != user_record.transaction_points THEN
      mismatch_count := mismatch_count + 1;
      RAISE NOTICE 'MISMATCH: % - Profile: %, Transactions: %', 
        user_record.email, user_record.profile_points, user_record.transaction_points;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Verification complete: % users checked, % mismatches found', 
    total_users, mismatch_count;
    
  IF mismatch_count = 0 THEN
    RAISE NOTICE 'SUCCESS: All user points are properly synchronized!';
  ELSE
    RAISE NOTICE 'WARNING: % users still have point mismatches', mismatch_count;
  END IF;
END $$;