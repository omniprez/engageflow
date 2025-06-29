import React from 'react'
import { Filter } from 'lucide-react'

interface GoalFiltersProps {
  filters: {
    status: string
    priority: string
    type: string
    dateRange: string
  }
  onFilterChange: (key: string, value: string) => void
}

export function GoalFilters({ filters, onFilterChange }: GoalFiltersProps) {
  return (
    <div className="card">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Filter className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="all">All Types</option>
          <option value="personal">Personal</option>
          <option value="team">Team</option>
          <option value="company">Company</option>
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => onFilterChange('dateRange', e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>
    </div>
  )
}