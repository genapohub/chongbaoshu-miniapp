<template>
  <view class="page">
    <NavBar title="繁育详情" :showBack="true" />
    
    <view class="content">
      <view class="breeding-header">
        <view class="breeding-status" :class="breeding.status">
          {{ statusText }}
        </view>
        <view class="breeding-date">{{ formatDate(breeding.breedingDate) }}</view>
      </view>
      
      <view class="section">
        <view class="section-title">配种信息</view>
        <view class="breeding-info">
          <view class="info-row">
            <text class="info-label">公犬</text>
            <text class="info-value">{{ breeding.malePetName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">母犬</text>
            <text class="info-value">{{ breeding.femalePetName }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">配种日期</text>
            <text class="info-value">{{ formatDate(breeding.breedingDate) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">预产期</text>
            <text class="info-value">{{ breeding.expectedDeliveryDate ? formatDate(breeding.expectedDeliveryDate) : '-' }}</text>
          </view>
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">备注</view>
        <view class="notes-content">
          {{ breeding.notes || '暂无备注' }}
        </view>
      </view>
      
      <view class="section">
        <view class="section-title">繁育进度</view>
        <view class="progress-timeline">
          <view class="timeline-item" :class="{ active: true }">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-title">配种成功</text>
              <text class="timeline-date">{{ formatDate(breeding.breedingDate) }}</text>
            </view>
          </view>
          <view class="timeline-item" :class="{ active: breeding.status === 'completed' }">
            <view class="timeline-dot"></view>
            <view class="timeline-content">
              <text class="timeline-title">分娩完成</text>
              <text class="timeline-date">{{ breeding.status === 'completed' ? formatDate(new Date()) : '-' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="btn-group">
        <view class="btn-outline" @click="handleCancel" v-if="breeding.status === 'pending'">取消配种</view>
        <view class="btn-primary" @click="handleComplete" v-if="breeding.status === 'pending'">标记完成</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { formatDate, showToast, showModal } from '@/utils'

const breeding = reactive({
  id: '1',
  malePetId: '1',
  femalePetId: '2',
  malePetName: '旺财',
  femalePetName: '花花',
  breedingDate: '2024-03-15',
  expectedDeliveryDate: '2024-06-15',
  status: 'pending' as 'pending' | 'completed' | 'cancelled',
  notes: '首次配种，状态良好',
  createdAt: '2024-03-15',
  updatedAt: '2024-03-15'
})

const statusText = computed(() => {
  const map = {
    pending: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[breeding.status]
})

async function handleCancel() {
  const confirm = await showModal('确认取消', '确定要取消这次配种记录吗？')
  if (confirm) {
    breeding.status = 'cancelled'
    showToast('已取消', 'success')
  }
}

async function handleComplete() {
  const confirm = await showModal('确认完成', '确定标记为分娩完成吗？')
  if (confirm) {
    breeding.status = 'completed'
    showToast('已完成', 'success')
  }
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

.breeding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  
  .breeding-status {
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: #fff;
    
    &.pending { background: rgba(255, 255, 255, 0.2); }
    &.completed { background: #52c41a; }
    &.cancelled { background: #999; }
  }
  
  .breeding-date {
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.8);
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

.breeding-info {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm 0;
    border-bottom: 1rpx solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-size: $font-size-base;
      color: $text-light;
    }
    
    .info-value {
      font-size: $font-size-base;
      color: $text-primary;
      font-weight: bold;
    }
  }
}

.notes-content {
  font-size: $font-size-base;
  color: $text-secondary;
  line-height: 1.6;
}

.progress-timeline {
  .timeline-item {
    display: flex;
    padding: $spacing-md 0;
    
    &:not(:last-child) {
      border-bottom: 1rpx solid $border-color;
    }
    
    &.active {
      .timeline-dot {
        background: $primary-color;
        
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8rpx;
          height: 8rpx;
          background: #fff;
          border-radius: 50%;
        }
      }
      
      .timeline-title {
        color: $text-primary;
      }
      
      .timeline-date {
        color: $text-secondary;
      }
    }
    
    .timeline-dot {
      position: relative;
      width: 24rpx;
      height: 24rpx;
      background: $border-color;
      border-radius: 50%;
      margin-right: $spacing-md;
      flex-shrink: 0;
    }
    
    .timeline-content {
      flex: 1;
      
      .timeline-title {
        font-size: $font-size-base;
        color: $text-light;
        display: block;
      }
      
      .timeline-date {
        font-size: $font-size-sm;
        color: $text-placeholder;
        margin-top: $spacing-xs;
        display: block;
      }
    }
  }
}

.btn-group {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-lg;
  
  .btn-outline {
    flex: 1;
    padding: $spacing-lg;
    border: 2rpx solid $text-light;
    border-radius: $border-radius-lg;
    text-align: center;
    font-size: $font-size-lg;
    color: $text-secondary;
  }
  
  .btn-primary {
    flex: 1;
    padding: $spacing-lg;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    border-radius: $border-radius-lg;
    text-align: center;
    font-size: $font-size-lg;
    color: #fff;
    font-weight: bold;
  }
}
</style>
