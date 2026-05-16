import { get, post, put, del } from '@/utils/request'

export interface Breeding {
  id: string
  malePetId: string
  femalePetId: string
  malePetName: string
  femalePetName: string
  breedingDate: string
  expectedDeliveryDate: string
  status: 'pending' | 'completed' | 'cancelled'
  notes: string
  createdAt: string
  updatedAt: string
}

export interface BreedingListResponse {
  code: number
  data: Breeding[]
  message: string
}

export interface BreedingResponse {
  code: number
  data: Breeding
  message: string
}

export async function getBreedingList(): Promise<BreedingListResponse> {
  return get('/api/breedings')
}

export async function getBreedingDetail(id: string): Promise<BreedingResponse> {
  return get(`/api/breedings/${id}`)
}

export async function createBreeding(data: Omit<Breeding, 'id' | 'createdAt' | 'updatedAt'>): Promise<BreedingResponse> {
  return post('/api/breedings', data)
}

export async function updateBreeding(id: string, data: Partial<Breeding>): Promise<BreedingResponse> {
  return put(`/api/breedings/${id}`, data)
}

export async function deleteBreeding(id: string): Promise<{ code: number; message: string }> {
  return del(`/api/breedings/${id}`)
}
