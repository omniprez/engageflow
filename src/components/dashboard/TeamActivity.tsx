import React from 'react'
import { motion } from 'framer-motion'
import { Users, Award } from 'lucide-react'

export function TeamActivity() {
  // Mock data
  const activities = [
    {
      id: '1',
      user: 'Sarah Johnson',
      action: 'completed goal',
      goal: 'Q1 Sales Target',
      points: 100,
      time: '2 hours ago'
    },
    {
      id: '2',
      user: 'Mike Chen',
      action: 'earned badge',
      goal: 'Team Player',
      points: 50,
      time: '4 hours ago'
    },
    {
      id: '3',
      user: 'Emily Davis',
      action: 'created goal',
      goal: 'Customer Satisfaction',
      points: 25,
      time: '1 day ago'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Team Activity</h3>
        <Users className="h-5 w-5 text-gray-400" />
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No team activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                  <span className="font-medium">"{activity.goal}"</span>
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{activity.time}</p>
                  <span className="text-xs font-semibold text-green-600">
                    +{activity.points} pts
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}