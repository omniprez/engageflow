import React from 'react'
import { Goal } from '../../types'
import { motion } from 'framer-motion'
import { Target, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface GoalProgressProps {
  goals: Goal[]
}

export function GoalProgress({ goals }: GoalProgressProps) {
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 5)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
        <Target className="h-5 w-5 text-gray-400" />
      </div>
      
      {activeGoals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No active goals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate">{goal.title}</h4>
                <span className="text-sm text-gray-500">{goal.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Due {format(new Date(goal.due_date), 'MMM d')}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}