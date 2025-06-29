import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, Trophy, Users, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function QuickActions() {
  const actions = [
    {
      name: 'Create Goal',
      description: 'Set a new objective to achieve',
      icon: Target,
      href: '/goals',
      color: 'from-primary-500 to-primary-600',
      hoverColor: 'hover:from-primary-600 hover:to-primary-700'
    },
    {
      name: 'View Progress',
      description: 'Check your achievements',
      icon: Trophy,
      href: '/dashboard',
      color: 'from-success-500 to-success-600',
      hoverColor: 'hover:from-success-600 hover:to-success-700'
    },
    {
      name: 'Team Goals',
      description: 'Collaborate with others',
      icon: Users,
      href: '/team',
      color: 'from-secondary-500 to-secondary-600',
      hoverColor: 'hover:from-secondary-600 hover:to-secondary-700'
    }
  ]

  return (
    <div className="card">
      <div className="section-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="section-title text-lg">Quick Actions</h3>
              <p className="text-sm text-neutral-600">Get things done faster</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={action.href}
              className={`group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${action.color} ${action.hoverColor} text-white transition-all duration-300 hover:shadow-large transform hover:scale-[1.02]`}
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{action.name}</p>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-neutral-50 to-primary-50/50 rounded-xl border border-neutral-200/50">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Plus className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Need help getting started?</p>
            <p className="text-xs text-neutral-600">Check out our goal templates for inspiration</p>
          </div>
        </div>
      </div>
    </div>
  )
}