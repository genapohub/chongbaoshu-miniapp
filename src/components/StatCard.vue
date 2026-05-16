<template>
  <view class="stat-card" :style="{ background: bgColor }">
    <view class="stat-icon">{{ icon }}</view>
    <view class="stat-content">
      <view class="stat-value">{{ value }}</view>
      <view class="stat-label">{{ label }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  value: number | string
  label: string
  bgColor?: string
}>()
</script>

<style lang="scss" scoped>
.stat-card {
  display: flex;
  align-items: center;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  color: #fff;
  
  .stat-icon {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: $border-radius-md;
    font-size: $font-size-xl;
  }
  
  .stat-content {
    margin-left: $spacing-md;
    
    .stat-value {
      font-size: $font-size-xxl;
      font-weight: bold;
    }
    
    .stat-label {
      font-size: $font-size-sm;
      opacity: 0.8;
      margin-top: $spacing-xs;
    }
  }
}
</style>
