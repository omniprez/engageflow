import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'

export function UpcomingDeadlines() {
  // Mock data
  const deadlines = [
    {
      id: '1',
      title: 'Complete Q1 Review',
      dueDate: '2024-03-15',
      priority: 'high' as const
    },
    {
      id: '2',
      title: 'Submit Training Report',
      dueDate: '2024-03-20',
      priority: 'medium' as const
    },
    {
      id: '3',
      title: 'Team Meeting Prep',
      dueDate: '2024-03-25',
      priority: 'low' as const
    }
  ]

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>
      
      {deadlines.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No upcoming deadlines</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((deadline, index) => (
            <motion.div
              key={deadline.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{deadline.title}</p>
                <p className="text-sm text-gray-500">Due {deadline.dueDate}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[deadline.priority]}`}>
                {deadline.priority}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}