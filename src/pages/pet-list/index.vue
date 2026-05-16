<template>
  <view class="page">
    <NavBar title="宠物列表">
      <template #right>
        <view class="add-btn" @click="goToAddPet">+</view>
      </template>
    </NavBar>
    
    <view class="content">
      <view class="filter-bar">
        <view 
          class="filter-item" 
          :class="{ active: filter === 'all' }" 
          @click="setFilter('all')"
        >
          全部
        </view>
        <view 
          class="filter-item" 
          :class="{ active: filter === 'male' }" 
          @click="setFilter('male')"
        >
          公犬
        </view>
        <view 
          class="filter-item" 
          :class="{ active: filter === 'female' }" 
          @click="setFilter('female')"
        >
          母犬
        </view>
      </view>
      
      <view class="pet-list">
        <PetCard 
          v-for="pet in filteredPets" 
          :key="pet.id" 
          :pet="pet" 
          @click="goToPetDetail" 
        />
        <view v-if="filteredPets.length === 0" class="empty-state">
          <text class="empty-icon">🐾</text>
          <text class="empty-text">暂无宠物</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import PetCard from '@/components/PetCard.vue'
import { usePetStore } from '@/store/pet'
import type { Pet } from '@/api/pet'

const petStore = usePetStore()
const filter = ref<'all' | 'male' | 'female'>('all')

const filteredPets = computed(() => {
  if (filter.value === 'all') return petStore.pets
  return petStore.pets.filter(pet => pet.gender === filter.value)
})

function setFilter(value: 'all' | 'male' | 'female') {
  filter.value = value
}

function goToAddPet() {
  uni.navigateTo({ url: '/pages/pet-add/index' })
}

function goToPetDetail(pet: Pet) {
  petStore.setCurrentPet(pet)
  uni.navigateTo({ url: `/pages/pet-detail/index?id=${pet.id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-secondary;
}

.content {
  padding: $spacing-md;
}

.add-btn {
  font-size: $font-size-xl;
  color: #fff;
  font-weight: bold;
}

.filter-bar {
  display: flex;
  background: $bg-primary;
  border-radius: $border-radius-md;
  padding: $spacing-xs;
  margin-bottom: $spacing-md;
  
  .filter-item {
    flex: 1;
    text-align: center;
    padding: $spacing-sm;
    font-size: $font-size-base;
    color: $text-secondary;
    border-radius: $border-radius-sm;
    transition: all 0.2s;
    
    &.active {
      background: $primary-color;
      color: #fff;
    }
  }
}

.pet-list {
  .pet-card {
    margin-bottom: $spacing-md;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl * 3;
  
  .empty-icon {
    font-size: 80rpx;
    margin-bottom: $spacing-md;
  }
  
  .empty-text {
    font-size: $font-size-base;
    color: $text-light;
  }
}
</style>
