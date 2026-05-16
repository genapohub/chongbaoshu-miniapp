<template>
  <view class="page">
    <NavBar title="工作台" />
    <view class="content">
      <view class="greeting">
        <text class="greeting-text">您好，欢迎回来</text>
        <text class="greeting-name">{{ userStore.user?.name || '用户' }}</text>
      </view>
      
      <view class="stats-grid">
        <StatCard icon="🐾" :value="petStore.pets.length" label="宠物总数" bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
        <StatCard icon="❤️" :value="petStore.healthyCount" label="健康宠物" bgColor="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" />
        <StatCard icon="🐕" :value="petStore.maleCount" label="公犬" bgColor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
        <StatCard icon="🐩" :value="petStore.femaleCount" label="母犬" bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
      </view>
      
      <view class="section">
        <view class="section-header">
          <text class="section-title">快捷操作</text>
        </view>
        <view class="quick-actions">
          <view class="action-item" @click="goToAddPet">
            <view class="action-icon pet">+</view>
            <text class="action-text">添加宠物</text>
          </view>
          <view class="action-item" @click="goToAddBreeding">
            <view class="action-icon breeding">♡</view>
            <text class="action-text">添加配种</text>
          </view>
          <view class="action-item" @click="goToAddHealth">
            <view class="action-icon health">⚕️</view>
            <text class="action-text">健康记录</text>
          </view>
          <view class="action-item" @click="goToPedigree">
            <view class="action-icon pedigree">📜</view>
            <text class="action-text">血统证书</text>
          </view>
        </view>
      </view>
      
      <view class="section">
        <view class="section-header">
          <text class="section-title">最近宠物</text>
          <text class="section-more" @click="goToPetList">查看全部 →</text>
        </view>
        <view class="pet-list">
          <PetCard v-for="pet in recentPets" :key="pet.id" :pet="pet" @click="goToPetDetail" />
          <view v-if="petStore.pets.length === 0" class="empty-state">
            <text class="empty-icon">🐾</text>
            <text class="empty-text">暂无宠物，快去添加吧</text>
            <view class="empty-btn" @click="goToAddPet">添加宠物</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import StatCard from '@/components/StatCard.vue'
import PetCard from '@/components/PetCard.vue'
import { usePetStore } from '@/store/pet'
import { useUserStore } from '@/store/user'
import type { Pet } from '@/api/pet'

const petStore = usePetStore()
const userStore = useUserStore()

const recentPets = computed(() => petStore.pets.slice(0, 3))

function goToAddPet() {
  uni.navigateTo({ url: '/pages/pet-add/index' })
}

function goToAddBreeding() {
  uni.navigateTo({ url: '/pages/breeding-add/index' })
}

function goToAddHealth() {
  uni.navigateTo({ url: '/pages/health-add/index' })
}

function goToPedigree() {
  uni.navigateTo({ url: '/pages/pedigree/index' })
}

function goToPetList() {
  uni.switchTab({ url: '/pages/pet-list/index' })
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

.greeting {
  margin-bottom: $spacing-lg;
  
  .greeting-text {
    font-size: $font-size-base;
    color: $text-secondary;
  }
  
  .greeting-name {
    display: block;
    font-size: $font-size-xxl;
    font-weight: bold;
    color: $text-primary;
    margin-top: $spacing-xs;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.section {
  background: $bg-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    
    .section-title {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $text-primary;
    }
    
    .section-more {
      font-size: $font-size-sm;
      color: $primary-color;
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .action-icon {
      width: 100rpx;
      height: 100rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $border-radius-lg;
      font-size: $font-size-xl;
      
      &.pet { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
      &.breeding { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; }
      &.health { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #fff; }
      &.pedigree { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #fff; }
    }
    
    .action-text {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-top: $spacing-sm;
    }
  }
}

.pet-list {
  .pet-card {
    margin-bottom: $spacing-md;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl * 2;
  
  .empty-icon {
    font-size: 80rpx;
    margin-bottom: $spacing-md;
  }
  
  .empty-text {
    font-size: $font-size-base;
    color: $text-light;
    margin-bottom: $spacing-md;
  }
  
  .empty-btn {
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    color: #fff;
    border-radius: $border-radius-md;
    font-size: $font-size-base;
  }
}
</style>
