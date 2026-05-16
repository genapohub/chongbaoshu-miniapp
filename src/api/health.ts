import { get, post, put, del } from '@/utils/request'

export interface HealthRecord {
  id: string
  petId: string
  petName: string
  type: 'vaccination' | 'deworming' | 'checkup' | 'treatment'
  title: string
  description: string
  recordDate: string
  nextDate?: string
  veterinarian: string
  createdAt: string
  updatedAt: string
}

export interface HealthListResponse {
  code: number
  data: HealthRecord[]
  message: string
}

export interface HealthResponse {
  code: number
  data: HealthRecord
  message: string
}

export async function getHealthList(petId?: string): Promise<HealthListResponse> {
  return get('/api/health-records', petId ? { petId } : {})
}

export async function getHealthDetail(id: string): Promise<HealthResponse> {
  return get(`/api/health-records/${id}`)
}

export async function createHealth(data: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthResponse> {
  return post('/api/health-records', data)
}

export async function updateHealth(id: string, data: Partial<HealthRecord>): Promise<HealthResponse> {
  return put(`/api/health-records/${id}`, data)
}

export async function deleteHealth(id: string): Promise<{ code: number; message: string }> {
  return del(`/api/health-records/${id}`)
}
