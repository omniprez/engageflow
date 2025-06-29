import React from 'react'
import { PointTransaction } from '../../types'
import { motion } from 'framer-motion'
import { Activity, Plus } from 'lucide-react'
import { format } from 'date-fns'

interface RecentActivityProps {
  activities: PointTransaction[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Activity className="h-5 w-5 text-gray-400" />
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-sm font-semibold text-green-600">
                  +{activity.points}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}