-- Create a more reliable sync_user_points function that can be called from the frontend
DROP FUNCTION IF EXISTS sync_user_points(uuid);

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
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sync_user_points(uuid) TO authenticated;

-- Run a sync for all users to ensure data is correct
DO $$
BEGIN
  PERFORM sync_user_points();
END $$;