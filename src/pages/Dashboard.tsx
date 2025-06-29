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
import { Target, Trophy, TrendingUp, Award, Zap, Calendar, Users, Star } from 'lucide-react'

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

  const getMotivationalMessage = () => {
    const messages = [
      "You're making great progress! Keep up the momentum.",
      "Every goal completed is a step towards success.",
      "Your dedication is inspiring. Keep pushing forward!",
      "Great things happen when you stay consistent.",
      "You're building something amazing, one goal at a time."
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-3xl p-8 text-white shadow-large"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    {getGreeting()}, {user?.full_name}! 👋
                  </h1>
                  <p className="text-primary-100 text-lg">
                    {getMotivationalMessage()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Level {stats?.currentLevel || user?.level}</p>
                    <p className="text-primary-100 text-sm">Current Level</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalPoints || user?.points}</p>
                    <p className="text-primary-100 text-sm">Total Points</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.activeGoals || 0}</p>
                    <p className="text-primary-100 text-sm">Active Goals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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