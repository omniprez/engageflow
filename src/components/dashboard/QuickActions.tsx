import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function QuickActions() {
  const actions = [
    {
      name: 'Create Goal',
      description: 'Set a new objective',
      icon: Target,
      href: '/goals',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'View Progress',
      description: 'Check your achievements',
      icon: Trophy,
      href: '/dashboard',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Team Goals',
      description: 'Collaborate with others',
      icon: Users,
      href: '/team',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <Plus className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={action.href}
              className={`flex items-center p-3 rounded-lg text-white transition-colors ${action.color}`}
            >
              <action.icon className="h-5 w-5 mr-3" />
              <div>
                <p className="font-medium">{action.name}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}