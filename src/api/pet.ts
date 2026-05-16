import { get, post, put, del } from '@/utils/request'

export interface Pet {
  id: string
  name: string
  breed: string
  gender: 'male' | 'female'
  birthDate: string
  avatar: string
  color: string
  weight: number
  healthStatus: 'healthy' | 'sick' | 'recovering'
  createdAt: string
  updatedAt: string
}

export interface PetListResponse {
  code: number
  data: Pet[]
  message: string
}

export interface PetResponse {
  code: number
  data: Pet
  message: string
}

export async function getPetList(): Promise<PetListResponse> {
  return get('/api/pets')
}

export async function getPetDetail(id: string): Promise<PetResponse> {
  return get(`/api/pets/${id}`)
}

export async function createPet(data: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<PetResponse> {
  return post('/api/pets', data)
}

export async function updatePet(id: string, data: Partial<Pet>): Promise<PetResponse> {
  return put(`/api/pets/${id}`, data)
}

export async function deletePet(id: string): Promise<{ code: number; message: string }> {
  return del(`/api/pets/${id}`)
}
