import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, SubscriptionPlan } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const subscriptionPlans = ref<SubscriptionPlan[]>([])
  const remindSettings = ref({
    healthRemind: true,
    breedingRemind: true,
    deliveryRemind: true,
    remindTime: '09:00'
  })

  function setUser(data: User) {
    user.value = data
  }

  function updateUser(data: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...data }
    }
  }

  function setSubscriptionPlans(data: SubscriptionPlan[]) {
    subscriptionPlans.value = data
  }

  function updateRemindSettings(settings: Partial<typeof remindSettings.value>) {
    remindSettings.value = { ...remindSettings.value, ...settings }
  }

  return {
    user,
    subscriptionPlans,
    remindSettings,
    setUser,
    updateUser,
    setSubscriptionPlans,
    updateRemindSettings
  }
})
