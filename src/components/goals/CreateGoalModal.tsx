import React, { useState } from 'react'
import { Goal } from '../../types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Calendar, Flag } from 'lucide-react'
import { format } from 'date-fns'

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goalData: Partial<Goal>) => void
}

export function CreateGoalModal({ isOpen, onClose, onSubmit }: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'personal' as Goal['type'],
    priority: 'medium' as Goal['priority'],
    start_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    target_value: '',
    unit: '',
    current_value: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const goalData: Partial<Goal> = {
      ...formData,
      target_value: formData.target_value ? parseInt(formData.target_value) : undefined,
      unit: formData.unit || undefined
    }
    
    onSubmit(goalData)
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'personal',
      priority: 'medium',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      target_value: '',
      unit: '',
      current_value: 0
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Target className="h-4 w-4 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Create New Goal</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="label">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="input"
                    placeholder="Enter goal title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="input"
                    placeholder="Describe your goal"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="label">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="input"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="personal">Personal</option>
                      <option value="team">Team</option>
                      <option value="company">Company</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="label">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      className="input"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_date" className="label">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      className="input"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="due_date" className="label">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      id="due_date"
                      name="due_date"
                      required
                      className="input"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="target_value" className="label">
                      Target Value
                    </label>
                    <input
                      type="number"
                      id="target_value"
                      name="target_value"
                      className="input"
                      placeholder="e.g., 100"
                      value={formData.target_value}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="unit" className="label">
                      Unit
                    </label>
                    <input
                      type="text"
                      id="unit"
                      name="unit"
                      className="input"
                      placeholder="e.g., hours, tasks"
                      value={formData.unit}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}