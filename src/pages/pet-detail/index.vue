<template>
  <view class="page">
    <NavBar title="宠物详情" :showBack="true">
      <template #right>
        <view class="edit-btn" @click="goToEdit">编辑</view>
      </template>
    </NavBar>
    
    <view class="content" v-if="pet">
      <view class="pet-header">
        <image class="pet-avatar" :src="pet.avatar || defaultAvatar" mode="aspectFill" />
        <view class="pet-info">
          <view class="pet-name">{{ pet.name }}</view>
          <view class="pet-breed">{{ pet.breed }}</view>
          <view class="pet-meta">
            <text>{{ pet.gender === 'male' ? '公' : '母' }}</text>
            <text>·</text>
            <text>{{ getAge(pet.birthDate) }}</text>
          </view>
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">基本信息</view>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">颜色</text>
            <text class="info-value">{{ pet.color || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">体重</text>
            <text class="info-value">{{ pet.weight ? pet.weight + ' kg' : '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">出生日期</text>
            <text class="info-value">{{ formatDate(pet.birthDate) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">健康状态</text>
            <text class="info-value" :class="pet.healthStatus">{{ healthStatusText }}</text>
          </view>
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">操作</view>
        <view class="action-grid">
          <view class="action-item" @click="goToAddHealth">
            <view class="action-icon">⚕️</view>
            <text class="action-text">健康记录</text>
          </view>
          <view class="action-item" @click="goToAddBreeding">
            <view class="action-icon">♡</view>
            <text class="action-text">配种记录</text>
          </view>
          <view class="action-item" @click="goToPedigree">
            <view class="action-icon">📜</view>
            <text class="action-text">血统证书</text>
          </view>
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">历史记录</view>
        <view class="history-list">
          <view v-if="healthRecords.length === 0" class="empty-history">
            <text class="empty-icon">📝</text>
            <text class="empty-text">暂无记录</text>
          </view>
          <view v-for="record in healthRecords" :key="record.id" class="history-item">
            <view class="history-icon">{{ getTypeIcon(record.type) }}</view>
            <view class="history-content">
              <view class="history-title">{{ record.title }}</view>
              <view class="history-date">{{ formatDate(record.recordDate) }}</view>
            </view>
            <view class="history-arrow">›</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onLoad } from '@dcloudio/uni-app'
import NavBar from '@/components/NavBar.vue'
import { usePetStore } from '@/store/pet'
import type { Pet } from '@/api/pet'
import { getAge, formatDate } from '@/utils'

const petStore = usePetStore()
const pet = ref<Pet | null>(null)

const defaultAvatar = 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20pet%20avatar%20cartoon%20style&image_size=square'

const healthRecords = ref([
  { id: '1', type: 'vaccination' as const, title: '狂犬疫苗接种', recordDate: '2024-01-15' },
  { id: '2', type: 'checkup' as const, title: '年度体检', recordDate: '2024-02-20' },
  { id: '3', type: 'deworming' as const, title: '体内驱虫', recordDate: '2024-03-10' }
])

const healthStatusText = computed(() => {
  if (!pet.value) return ''
  const map = {
    healthy: '健康',
    sick: '生病',
    recovering: '康复中'
  }
  return map[pet.value.healthStatus]
})

onLoad((options) => {
  if (options?.id) {
    const found = petStore.pets.find(p => p.id === options.id)
    if (found) {
      pet.value = found
    }
  } else if (petStore.currentPet) {
    pet.value = petStore.currentPet
  }
})

function goToEdit() {
  if (pet.value) {
    petStore.setCurrentPet(pet.value)
    uni.navigateTo({ url: '/pages/pet-edit/index' })
  }
}

function goToAddHealth() {
  uni.navigateTo({ url: '/pages/health-add/index' })
}

function goToAddBreeding() {
  uni.navigateTo({ url: '/pages/breeding-add/index' })
}

function goToPedigree() {
  uni.navigateTo({ url: '/pages/pedigree/index' })
}

function getTypeIcon(type: string) {
  const map: Record<string, string> = {
    vaccination: '💉',
    deworming: '🪱',
    checkup: '🔍',
    treatment: '🏥'
  }
  return map[type] || '📝'
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

.edit-btn {
  font-size: $font-size-base;
  color: #fff;
}

.pet-header {
  display: flex;
  background: $bg-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  
  .pet-avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: $border-radius-lg;
    background: $bg-grey;
  }
  
  .pet-info {
    flex: 1;
    margin-left: $spacing-lg;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .pet-name {
      font-size: $font-size-xl;
      font-weight: bold;
      color: $text-primary;
    }
    
    .pet-breed {
      font-size: $font-size-base;
      color: $text-secondary;
      margin-top: $spacing-xs;
    }
    
    .pet-meta {
      font-size: $font-size-sm;
      color: $text-light;
      margin-top: $spacing-xs;
    }
  }
}

.section {
  background: $bg-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  
  .section-title {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .info-label {
      font-size: $font-size-sm;
      color: $text-light;
    }
    
    .info-value {
      font-size: $font-size-sm;
      color: $text-primary;
      
      &.healthy { color: #52c41a; }
      &.sick { color: #f5222d; }
      &.recovering { color: #faad14; }
    }
  }
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-md;
    
    .action-icon {
      font-size: 48rpx;
      margin-bottom: $spacing-sm;
    }
    
    .action-text {
      font-size: $font-size-sm;
      color: $text-secondary;
    }
  }
}

.history-list {
  .history-item {
    display: flex;
    align-items: center;
    padding: $spacing-md 0;
    border-bottom: 1rpx solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
    
    .history-icon {
      font-size: 36rpx;
      margin-right: $spacing-md;
    }
    
    .history-content {
      flex: 1;
      
      .history-title {
        font-size: $font-size-base;
        color: $text-primary;
      }
      
      .history-date {
        font-size: $font-size-sm;
        color: $text-light;
        margin-top: $spacing-xs;
      }
    }
    
    .history-arrow {
      font-size: $font-size-lg;
      color: $text-placeholder;
    }
  }
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl * 2;
  
  .empty-icon {
    font-size: 64rpx;
    margin-bottom: $spacing-md;
  }
  
  .empty-text {
    font-size: $font-size-base;
    color: $text-light;
  }
}
</style>
