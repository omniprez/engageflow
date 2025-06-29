import React from 'react'
import { motion } from 'framer-motion'
import { DivideIcon as LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'yellow'
  change?: number
}

export function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      border: 'border-primary-200',
      gradient: 'from-primary-500 to-primary-600'
    },
    green: {
      bg: 'bg-success-50',
      text: 'text-success-600',
      border: 'border-success-200',
      gradient: 'from-success-500 to-success-600'
    },
    purple: {
      bg: 'bg-secondary-50',
      text: 'text-secondary-600',
      border: 'border-secondary-200',
      gradient: 'from-secondary-500 to-secondary-600'
    },
    yellow: {
      bg: 'bg-warning-50',
      text: 'text-warning-600',
      border: 'border-warning-200',
      gradient: 'from-warning-500 to-warning-600'
    }
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="stat-card group cursor-pointer"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.gradient} rounded-t-2xl`}></div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border group-hover:scale-110 transition-transform duration-200`}>
              <Icon className={`h-6 w-6 ${colors.text}`} />
            </div>
            {change && (
              <div className="flex items-center space-x-1 text-success-600">
                <span className="text-xs font-semibold">+{change}%</span>
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm font-semibold text-neutral-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-neutral-900 mb-2">
              {value.toLocaleString()}
            </p>
            {change && (
              <p className="text-sm text-success-600 font-medium">
                +{change}% from last month
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtle background pattern */}
      <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5">
        <Icon className="w-full h-full" />
      </div>
    </motion.div>
  )
}