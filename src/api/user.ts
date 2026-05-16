import { get, post, put } from '@/utils/request'

export interface User {
  id: string
  name: string
  avatar: string
  phone: string
  kennelName: string
  kennelAddress: string
  subscriptionLevel: 'free' | 'basic' | 'premium'
  subscriptionExpireDate: string
  createdAt: string
  updatedAt: string
}

export interface UserResponse {
  code: number
  data: User
  message: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration: number
  features: string[]
}

export interface SubscriptionListResponse {
  code: number
  data: SubscriptionPlan[]
  message: string
}

export async function getUserInfo(): Promise<UserResponse> {
  return get('/api/user/info')
}

export async function updateUserInfo(data: Partial<User>): Promise<UserResponse> {
  return put('/api/user/info', data)
}

export async function updateKennel(data: { name: string; address: string }): Promise<UserResponse> {
  return put('/api/user/kennel', data)
}

export async function getSubscriptionPlans(): Promise<SubscriptionListResponse> {
  return get('/api/subscriptions')
}

export async function subscribePlan(planId: string): Promise<UserResponse> {
  return post('/api/subscriptions/subscribe', { planId })
}
