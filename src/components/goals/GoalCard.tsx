import React, { useState } from 'react'
import { Goal } from '../../types'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react'
import { format, isAfter, isBefore } from 'date-fns'

interface GoalCardProps {
  goal: Goal
  onUpdate: (goalId: string, updates: Partial<Goal>) => void
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const isOverdue = goal.status === 'active' && isAfter(new Date(), new Date(goal.due_date))
  const isDueSoon = goal.status === 'active' && 
    isBefore(new Date(), new Date(goal.due_date)) &&
    isAfter(new Date(goal.due_date), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const priorityColors = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500'
  }

  const handleStatusChange = (newStatus: Goal['status']) => {
    onUpdate(goal.id, { status: newStatus })
    setShowMenu(false)
  }

  const handleProgressUpdate = () => {
    const newProgress = prompt('Enter progress percentage (0-100):', goal.progress.toString())
    if (newProgress !== null) {
      const progress = Math.max(0, Math.min(100, parseInt(newProgress) || 0))
      onUpdate(goal.id, { 
        progress,
        status: progress === 100 ? 'completed' : goal.status
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card border-l-4 ${priorityColors[goal.priority]} relative`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
        </div>
        <div className="relative ml-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => handleStatusChange('active')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                disabled={goal.status === 'active'}
              >
                <Play className="h-3 w-3 mr-2" />
                Activate
              </button>
              <button
                onClick={() => handleStatusChange('paused')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                disabled={goal.status === 'paused'}
              >
                <Pause className="h-3 w-3 mr-2" />
                Pause
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center"
                disabled={goal.status === 'completed'}
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Complete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status and Type */}
      <div className="flex items-center space-x-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[goal.status]}`}>
          {goal.status}
        </span>
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          {goal.type}
        </span>
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          {goal.priority}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <button
            onClick={handleProgressUpdate}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {goal.progress}%
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Target Value */}
      {goal.target_value && (
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Target:</span>
            <span className="font-medium">
              {goal.current_value || 0} / {goal.target_value} {goal.unit}
            </span>
          </div>
        </div>
      )}

      {/* Due Date */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Due {format(new Date(goal.due_date), 'MMM d, yyyy')}</span>
        </div>
        
        {isOverdue && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Overdue</span>
          </div>
        )}
        
        {isDueSoon && !isOverdue && (
          <div className="flex items-center text-yellow-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Due Soon</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}