<template>
  <view class="pet-card" @click="handleClick">
    <image class="pet-avatar" :src="pet.avatar || defaultAvatar" mode="aspectFill" />
    <view class="pet-info">
      <view class="pet-name">{{ pet.name }}</view>
      <view class="pet-breed">{{ pet.breed }}</view>
      <view class="pet-meta">
        <text class="meta-item">{{ pet.gender === 'male' ? '公' : '母' }}</text>
        <text class="meta-divider">·</text>
        <text class="meta-item">{{ getAge(pet.birthDate) }}</text>
        <text class="meta-divider">·</text>
        <text class="meta-item health-status" :class="pet.healthStatus">
          {{ healthStatusText }}
        </text>
      </view>
    </view>
    <view class="pet-arrow">→</view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pet } from '@/api/pet'
import { getAge } from '@/utils'

const props = defineProps<{
  pet: Pet
}>()

const emit = defineEmits<{
  click: [pet: Pet]
}>()

const defaultAvatar = 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20pet%20avatar%20cartoon%20style&image_size=square'

const healthStatusText = computed(() => {
  const map = {
    healthy: '健康',
    sick: '生病',
    recovering: '康复中'
  }
  return map[props.pet.healthStatus]
})

function handleClick() {
  emit('click', props.pet)
}
</script>

<style lang="scss" scoped>
.pet-card {
  display: flex;
  align-items: center;
  background: $bg-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  
  .pet-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: $border-radius-md;
    background: $bg-grey;
  }
  
  .pet-info {
    flex: 1;
    margin-left: $spacing-md;
    
    .pet-name {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $text-primary;
    }
    
    .pet-breed {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin-top: $spacing-xs;
    }
    
    .pet-meta {
      display: flex;
      align-items: center;
      margin-top: $spacing-xs;
      
      .meta-item {
        font-size: $font-size-xs;
        color: $text-light;
        
        &.health-status {
          &.healthy { color: #52c41a; }
          &.sick { color: #f5222d; }
          &.recovering { color: #faad14; }
        }
      }
      
      .meta-divider {
        margin: 0 $spacing-xs;
        color: $text-placeholder;
      }
    }
  }
  
  .pet-arrow {
    font-size: $font-size-lg;
    color: $text-placeholder;
    margin-left: $spacing-sm;
  }
}
</style>
