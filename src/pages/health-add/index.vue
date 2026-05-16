<template>
  <view class="page">
    <NavBar title="添加健康记录" :showBack="true" />
    
    <view class="content">
      <view class="form-item">
        <text class="form-label">记录类型 *</text>
        <view class="type-options">
          <view 
            class="type-option" 
            :class="{ active: form.type === 'vaccination' }"
            @click="form.type = 'vaccination'"
          >
            💉 疫苗
          </view>
          <view 
            class="type-option" 
            :class="{ active: form.type === 'deworming' }"
            @click="form.type = 'deworming'"
          >
            🪱 驱虫
          </view>
          <view 
            class="type-option" 
            :class="{ active: form.type === 'checkup' }"
            @click="form.type = 'checkup'"
          >
            🔍 体检
          </view>
          <view 
            class="type-option" 
            :class="{ active: form.type === 'treatment' }"
            @click="form.type = 'treatment'"
          >
            🏥 治疗
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">记录标题 *</text>
        <input class="form-input" v-model="form.title" placeholder="请输入记录标题" />
      </view>
      
      <view class="form-item">
        <text class="form-label">记录日期 *</text>
        <picker mode="date" :value="form.recordDate" @change="onRecordDateChange">
          <view class="form-input picker">
            {{ form.recordDate || '请选择记录日期' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">下次提醒日期</text>
        <picker mode="date" :value="form.nextDate" @change="onNextDateChange">
          <view class="form-input picker">
            {{ form.nextDate || '请选择下次提醒日期（可选）' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">兽医姓名</text>
        <input class="form-input" v-model="form.veterinarian" placeholder="请输入兽医姓名" />
      </view>
      
      <view class="form-item">
        <text class="form-label">详细描述</text>
        <textarea 
          class="form-textarea" 
          v-model="form.description" 
          placeholder="请输入详细描述"
          :maxlength="500"
        />
      </view>
      
      <view class="submit-btn" @click="submitForm">保存</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { showToast } from '@/utils'

const form = reactive({
  type: 'vaccination' as 'vaccination' | 'deworming' | 'checkup' | 'treatment',
  title: '',
  recordDate: '',
  nextDate: '',
  veterinarian: '',
  description: ''
})

function onRecordDateChange(e: { detail: { value: string } }) {
  form.recordDate = e.detail.value
}

function onNextDateChange(e: { detail: { value: string } }) {
  form.nextDate = e.detail.value
}

function submitForm() {
  if (!form.title) {
    showToast('请输入记录标题', 'none')
    return
  }
  if (!form.recordDate) {
    showToast('请选择记录日期', 'none')
    return
  }
  
  showToast('添加成功', 'success')
  uni.navigateBack()
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

.form-item {
  background: $bg-primary;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  
  .form-label {
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: bold;
    margin-bottom: $spacing-md;
    display: block;
  }
  
  .form-input {
    width: 100%;
    padding: $spacing-md;
    border: 2rpx solid $border-color;
    border-radius: $border-radius-md;
    font-size: $font-size-base;
    box-sizing: border-box;
    
    &.picker {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: $text-secondary;
      
      .picker-arrow {
        font-size: $font-size-xl;
        color: $text-placeholder;
      }
    }
  }
  
  .form-textarea {
    width: 100%;
    height: 200rpx;
    padding: $spacing-md;
    border: 2rpx solid $border-color;
    border-radius: $border-radius-md;
    font-size: $font-size-base;
    box-sizing: border-box;
    resize: none;
  }
}

.type-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
  
  .type-option {
    text-align: center;
    padding: $spacing-md;
    border: 2rpx solid $border-color;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    transition: all 0.2s;
    
    &.active {
      border-color: $primary-color;
      background: $primary-light;
      color: $primary-color;
    }
  }
}

.submit-btn {
  margin-top: $spacing-lg;
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  color: #fff;
  text-align: center;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  font-size: $font-size-lg;
  font-weight: bold;
}
</style>
