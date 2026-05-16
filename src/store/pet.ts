import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pet } from '@/api/pet'

export const usePetStore = defineStore('pet', () => {
  const pets = ref<Pet[]>([])
  const currentPet = ref<Pet | null>(null)

  const healthyCount = computed(() => 
    pets.value.filter(p => p.healthStatus === 'healthy').length
  )

  const sickCount = computed(() => 
    pets.value.filter(p => p.healthStatus === 'sick').length
  )

  const maleCount = computed(() => 
    pets.value.filter(p => p.gender === 'male').length
  )

  const femaleCount = computed(() => 
    pets.value.filter(p => p.gender === 'female').length
  )

  function setPets(data: Pet[]) {
    pets.value = data
  }

  function addPet(pet: Pet) {
    pets.value.unshift(pet)
  }

  function updatePet(pet: Pet) {
    const index = pets.value.findIndex(p => p.id === pet.id)
    if (index !== -1) {
      pets.value[index] = pet
    }
  }

  function deletePet(id: string) {
    pets.value = pets.value.filter(p => p.id !== id)
  }

  function setCurrentPet(pet: Pet | null) {
    currentPet.value = pet
  }

  return {
    pets,
    currentPet,
    healthyCount,
    sickCount,
    maleCount,
    femaleCount,
    setPets,
    addPet,
    updatePet,
    deletePet,
    setCurrentPet
  }
})
