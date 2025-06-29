import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Goal } from '../types'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { GoalCard } from '../components/goals/GoalCard'
import { CreateGoalModal } from '../components/goals/CreateGoalModal'
import { GoalFilters } from '../components/goals/GoalFilters'
import { GoalTemplates } from '../components/goals/GoalTemplates'
import { motion } from 'framer-motion'
import { Plus, Target, Lightbulb, BarChart3 } from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns'
import toast from 'react-hot-toast'

export function Goals() {
  const { user, refreshUser } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all',
    dateRange: 'all'
  })

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user])

  const fetchGoals = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          owner:profiles(id, full_name, email)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (goalData: Partial<Goal>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          owner_id: user.id,
          progress: 0,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      setGoals([data, ...goals])
      setShowCreateModal(false)
      toast.success('Goal created successfully!')

      // Award points for creating a goal
      console.log('Creating point transaction for goal creation...')
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          points: 25,
          action: 'goal_created',
          description: 'Created a new goal',
          goal_id: data.id
        })

      if (transactionError) {
        console.error('Error creating point transaction:', transactionError)
      } else {
        console.log('Point transaction created successfully')
        // Wait a moment for the trigger to process
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Refresh user data to show updated points
        await refreshUser()
        toast.success('Goal created! +25 points awarded!')
      }

    } catch (error) {
      console.error('Error creating goal:', error)
      toast.error('Failed to create goal')
    }
  }

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user) return

    try {
      // Get the current goal to check if it's being completed
      const currentGoal = goals.find(g => g.id === goalId)
      if (!currentGoal) return

      const isBeingCompleted = updates.status === 'completed' && currentGoal.status !== 'completed'

      console.log('Updating goal:', goalId, 'Is being completed:', isBeingCompleted)

      // Update the goal
      const { error: updateError } = await supabase
        .from('goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', goalId)

      if (updateError) throw updateError

      // Update local state
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      ))

      // Award points for completing a goal
      if (isBeingCompleted) {
        console.log('Goal completed, awarding points...')
        
        // Insert point transaction (this will trigger the automatic point update via trigger)
        const { error: transactionError } = await supabase
          .from('point_transactions')
          .insert({
            user_id: user.id,
            points: 100,
            action: 'goal_completed',
            description: `Completed goal: ${currentGoal.title}`,
            goal_id: goalId
          })

        if (transactionError) {
          console.error('Error creating point transaction:', transactionError)
          throw transactionError
        }

        console.log('Point transaction created successfully')

        // Wait a moment for the trigger to process
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Refresh user data to show updated points
        await refreshUser()

        toast.success('Goal completed! +100 points awarded!')
      }

    } catch (error) {
      console.error('Error updating goal:', error)
      toast.error('Failed to update goal')
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleTemplateSelect = (template: any) => {
    const startDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(startDate.getDate() + template.durationDays)

    const goalData: Partial<Goal> = {
      title: template.title,
      description: template.description,
      type: template.type,
      priority: template.priority,
      start_date: format(startDate, 'yyyy-MM-dd'),
      due_date: format(dueDate, 'yyyy-MM-dd'),
      target_value: template.targetValue,
      unit: template.unit,
      current_value: 0
    }

    handleCreateGoal(goalData)
    setShowTemplates(false)
  }

  const getFilteredGoals = () => {
    return goals.filter(goal => {
      // Status filter
      if (filters.status !== 'all' && goal.status !== filters.status) {
        return false
      }

      // Priority filter
      if (filters.priority !== 'all' && goal.priority !== filters.priority) {
        return false
      }

      // Type filter
      if (filters.type !== 'all' && goal.type !== filters.type) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const goalDate = new Date(goal.due_date)
        const now = new Date()

        switch (filters.dateRange) {
          case 'week':
            if (goalDate < startOfWeek(now) || goalDate > endOfWeek(now)) return false
            break
          case 'month':
            if (goalDate < startOfMonth(now) || goalDate > endOfMonth(now)) return false
            break
          case 'quarter':
            if (goalDate < startOfQuarter(now) || goalDate > endOfQuarter(now)) return false
            break
        }
      }

      return true
    })
  }

  const filteredGoals = getFilteredGoals()

  const getGoalStats = () => {
    const total = filteredGoals.length
    const completed = filteredGoals.filter(g => g.status === 'completed').length
    const active = filteredGoals.filter(g => g.status === 'active').length
    const overdue = filteredGoals.filter(g => 
      g.status === 'active' && new Date(g.due_date) < new Date()
    ).length

    return { total, completed, active, overdue }
  }

  const stats = getGoalStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600">Track and manage your objectives</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Goal</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Goals</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      {/* Filters */}
      <GoalFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {goals.length === 0 
              ? 'Create your first goal to get started!'
              : 'Try adjusting your filters or create a new goal.'
            }
          </p>
          <div className="flex justify-center space-x-3">
            {goals.length === 0 && (
              <button
                onClick={() => setShowTemplates(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Browse Templates</span>
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{goals.length === 0 ? 'Create Your First Goal' : 'Create New Goal'}</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GoalCard goal={goal} onUpdate={handleUpdateGoal} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGoal}
      />

      <GoalTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  )
}