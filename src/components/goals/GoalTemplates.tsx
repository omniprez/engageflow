import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Clock, TrendingUp, Users, BookOpen, Heart } from 'lucide-react'

interface GoalTemplatesProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: any) => void
}

export function GoalTemplates({ isOpen, onClose, onSelectTemplate }: GoalTemplatesProps) {
  const templates = [
    {
      id: 1,
      title: 'Complete Training Course',
      description: 'Finish a professional development course',
      type: 'personal',
      priority: 'medium',
      durationDays: 30,
      targetValue: 1,
      unit: 'course',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Increase Sales by 20%',
      description: 'Boost monthly sales performance',
      type: 'personal',
      priority: 'high',
      durationDays: 90,
      targetValue: 20,
      unit: '%',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      id: 3,
      title: 'Team Collaboration Project',
      description: 'Lead a cross-functional team project',
      type: 'team',
      priority: 'high',
      durationDays: 60,
      targetValue: 1,
      unit: 'project',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      title: 'Customer Satisfaction Score',
      description: 'Improve customer satisfaction rating',
      type: 'personal',
      priority: 'medium',
      durationDays: 45,
      targetValue: 90,
      unit: '%',
      icon: Heart,
      color: 'bg-pink-500'
    },
    {
      id: 5,
      title: 'Process Improvement',
      description: 'Identify and implement process improvements',
      type: 'company',
      priority: 'medium',
      durationDays: 120,
      targetValue: 3,
      unit: 'improvements',
      icon: Target,
      color: 'bg-orange-500'
    },
    {
      id: 6,
      title: 'Skill Development',
      description: 'Learn a new technical skill',
      type: 'personal',
      priority: 'low',
      durationDays: 90,
      targetValue: 40,
      unit: 'hours',
      icon: Clock,
      color: 'bg-indigo-500'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Goal Templates</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`h-10 w-10 ${template.color} rounded-lg flex items-center justify-center mr-3`}>
                        <template.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.title}</h4>
                        <p className="text-xs text-gray-500">{template.type} • {template.priority}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{template.durationDays} days</span>
                      <span>Target: {template.targetValue} {template.unit}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}