export interface User {
  id: string
  email: string
  full_name: string
  role: 'employee' | 'manager' | 'admin'
  department: string
  points: number
  level: number
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  title: string
  description: string
  type: 'personal' | 'team' | 'company'
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  progress: number
  start_date: string
  due_date: string
  target_value?: number
  current_value?: number
  unit?: string
  owner_id: string
  owner?: User
  created_at: string
  updated_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  points: number
  action: string
  description: string
  goal_id?: string
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  criteria: any
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface DashboardStats {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  totalPoints: number
  currentLevel: number
  badgesEarned: number
  completionRate: number
}