import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

interface PointsChartProps {
  userId: string
}

export function PointsChart({ userId }: PointsChartProps) {
  // Mock data for the chart
  const mockData = [
    { day: 'Mon', points: 20 },
    { day: 'Tue', points: 45 },
    { day: 'Wed', points: 30 },
    { day: 'Thu', points: 60 },
    { day: 'Fri', points: 40 },
    { day: 'Sat', points: 25 },
    { day: 'Sun', points: 35 },
  ]

  const maxPoints = Math.max(...mockData.map(d => d.points))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Points This Week</h3>
        <TrendingUp className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="flex items-end space-x-2 h-32">
        {mockData.map((data, index) => (
          <div key={data.day} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(data.points / maxPoints) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="w-full bg-primary-600 rounded-t-sm min-h-[4px]"
            />
            <span className="text-xs text-gray-500 mt-2">{data.day}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Total: <span className="font-semibold">255 points</span> this week
        </p>
      </div>
    </div>
  )
}