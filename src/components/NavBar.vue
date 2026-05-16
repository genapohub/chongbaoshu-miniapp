<template>
  <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-content">
      <view class="navbar-left" @click="handleBack" v-if="showBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">{{ title }}</view>
      <view class="navbar-right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
  <view class="navbar-placeholder" :style="{ height: navBarHeight + 'px' }"></view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  showBack?: boolean
}>()

const statusBarHeight = ref(20)
const navBarHeight = ref(88)

uni.getSystemInfo({
  success: (res) => {
    statusBarHeight.value = res.statusBarHeight || 20
    navBarHeight.value = statusBarHeight.value + 44
  }
})

function handleBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  
  .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 $spacing-md;
  }
  
  .navbar-left {
    width: 80rpx;
    display: flex;
    align-items: center;
    
    .back-icon {
      font-size: $font-size-xl;
      color: #fff;
    }
  }
  
  .navbar-title {
    flex: 1;
    text-align: center;
    font-size: $font-size-lg;
    font-weight: bold;
    color: #fff;
  }
  
  .navbar-right {
    width: 80rpx;
    display: flex;
    justify-content: flex-end;
  }
}

.navbar-placeholder {
  width: 100%;
}
</style>
