import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { DashboardStats, Goal, PointTransaction } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { StatsCard } from '../components/dashboard/StatsCard'
import { GoalProgress } from '../components/dashboard/GoalProgress'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { PointsChart } from '../components/dashboard/PointsChart'
import { QuickActions } from '../components/dashboard/QuickActions'
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines'
import { TeamActivity } from '../components/dashboard/TeamActivity'
import { motion } from 'framer-motion'
import { Target, Trophy, TrendingUp, Award, Calendar, Users } from 'lucide-react'

export function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentGoals, setRecentGoals] = useState<Goal[]>([])
  const [recentActivity, setRecentActivity] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Refresh user data first to ensure we have the latest points
      await refreshUser()
      
      // Fetch goals stats
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('owner_id', user.id)

      const totalGoals = goals?.length || 0
      const completedGoals = goals?.filter(g => g.status === 'completed').length || 0
      const activeGoals = goals?.filter(g => g.status === 'active').length || 0

      // Fetch badges count
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)

      const badgesEarned = userBadges?.length || 0

      // Get the latest user data to ensure points are current
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('id', user.id)
        .single()

      const currentPoints = currentUser?.points || user.points || 0
      const currentLevel = currentUser?.level || user.level || 1

      setStats({
        totalGoals,
        completedGoals,
        activeGoals,
        totalPoints: currentPoints,
        currentLevel,
        badgesEarned,
        completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
      })

      // Fetch recent goals
      const { data: recentGoalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5)

      setRecentGoals(recentGoalsData || [])

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentActivity(activityData || [])
      setDataLoaded(true)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // If we have a user but data hasn't loaded yet, show a loading spinner
  if (user && !dataLoaded && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {user?.full_name}! 👋
          </h1>
          <p className="text-primary-100 mb-4">
            You're doing great! Keep up the momentum with your goals.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Level {stats?.currentLevel || user?.level}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>{stats?.totalPoints || user?.points} points</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>{stats?.activeGoals} active goals</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-white bg-opacity-5 rounded-full -mr-10 -mb-10"></div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Goals"
          value={stats?.totalGoals || 0}
          icon={Target}
          color="blue"
          change={stats?.totalGoals ? 12 : undefined}
        />
        <StatsCard
          title="Completed Goals"
          value={stats?.completedGoals || 0}
          icon={Trophy}
          color="green"
          change={stats?.completedGoals ? 8 : undefined}
        />
        <StatsCard
          title="Total Points"
          value={stats?.totalPoints || user?.points || 0}
          icon={TrendingUp}
          color="purple"
          change={stats?.totalPoints ? 15 : undefined}
        />
        <StatsCard
          title="Badges Earned"
          value={stats?.badgesEarned || 0}
          icon={Award}
          color="yellow"
          change={stats?.badgesEarned ? 25 : undefined}
        />
      </div>

      {/* Quick Actions and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <UpcomingDeadlines />
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PointsChart userId={user?.id || ''} />
        <GoalProgress goals={recentGoals} />
      </div>

      {/* Activity and Team Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivity} />
        <TeamActivity />
      </div>
    </div>
  )
}