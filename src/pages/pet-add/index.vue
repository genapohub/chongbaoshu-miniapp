<template>
  <view class="page">
    <NavBar title="添加宠物" :showBack="true" />
    
    <view class="content">
      <view class="form-item">
        <text class="form-label">宠物头像</text>
        <view class="avatar-upload" @click="chooseAvatar">
          <image v-if="form.avatar" :src="form.avatar" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">上传头像</text>
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">宠物名称 *</text>
        <input 
          class="form-input" 
          v-model="form.name" 
          placeholder="请输入宠物名称"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">品种 *</text>
        <input 
          class="form-input" 
          v-model="form.breed" 
          placeholder="请输入宠物品种"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">性别 *</text>
        <view class="gender-options">
          <view 
            class="gender-option" 
            :class="{ active: form.gender === 'male' }"
            @click="form.gender = 'male'"
          >
            🐕 公
          </view>
          <view 
            class="gender-option" 
            :class="{ active: form.gender === 'female' }"
            @click="form.gender = 'female'"
          >
            🐩 母
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">出生日期 *</text>
        <picker mode="date" :value="form.birthDate" @change="onBirthDateChange">
          <view class="form-input picker">
            {{ form.birthDate || '请选择出生日期' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">颜色</text>
        <input 
          class="form-input" 
          v-model="form.color" 
          placeholder="请输入宠物颜色"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">体重 (kg)</text>
        <input 
          class="form-input" 
          v-model.number="form.weight" 
          type="digit"
          placeholder="请输入体重"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">健康状态</text>
        <view class="status-options">
          <view 
            class="status-option healthy" 
            :class="{ active: form.healthStatus === 'healthy' }"
            @click="form.healthStatus = 'healthy'"
          >
            健康
          </view>
          <view 
            class="status-option sick" 
            :class="{ active: form.healthStatus === 'sick' }"
            @click="form.healthStatus = 'sick'"
          >
            生病
          </view>
          <view 
            class="status-option recovering" 
            :class="{ active: form.healthStatus === 'recovering' }"
            @click="form.healthStatus = 'recovering'"
          >
            康复中
          </view>
        </view>
      </view>
      
      <view class="submit-btn" @click="submitForm">
        保存
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { usePetStore } from '@/store/pet'
import { showToast } from '@/utils'

const petStore = usePetStore()

const form = reactive({
  name: '',
  breed: '',
  gender: 'male' as 'male' | 'female',
  birthDate: '',
  avatar: '',
  color: '',
  weight: 0,
  healthStatus: 'healthy' as 'healthy' | 'sick' | 'recovering'
})

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.avatar = res.tempFilePaths[0]
    }
  })
}

function onBirthDateChange(e: { detail: { value: string } }) {
  form.birthDate = e.detail.value
}

function submitForm() {
  if (!form.name) {
    showToast('请输入宠物名称', 'none')
    return
  }
  if (!form.breed) {
    showToast('请输入宠物品种', 'none')
    return
  }
  if (!form.birthDate) {
    showToast('请选择出生日期', 'none')
    return
  }
  
  const newPet = {
    id: Date.now().toString(),
    ...form,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  petStore.addPet(newPet)
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
}

.avatar-upload {
  width: 200rpx;
  height: 200rpx;
  border-radius: $border-radius-lg;
  overflow: hidden;
  background: $bg-grey;
  
  image {
    width: 100%;
    height: 100%;
  }
  
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .upload-icon {
      font-size: 48rpx;
      margin-bottom: $spacing-xs;
    }
    
    .upload-text {
      font-size: $font-size-sm;
      color: $text-light;
    }
  }
}

.gender-options {
  display: flex;
  gap: $spacing-md;
  
  .gender-option {
    flex: 1;
    text-align: center;
    padding: $spacing-md;
    border: 2rpx solid $border-color;
    border-radius: $border-radius-md;
    font-size: $font-size-base;
    color: $text-secondary;
    transition: all 0.2s;
    
    &.active {
      border-color: $primary-color;
      background: $primary-light;
      color: $primary-color;
    }
  }
}

.status-options {
  display: flex;
  gap: $spacing-sm;
  
  .status-option {
    flex: 1;
    text-align: center;
    padding: $spacing-md;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    border: 2rpx solid transparent;
    transition: all 0.2s;
    
    &.healthy {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;
      
      &.active {
        border-color: #52c41a;
      }
    }
    
    &.sick {
      background: rgba(245, 34, 45, 0.1);
      color: #f5222d;
      
      &.active {
        border-color: #f5222d;
      }
    }
    
    &.recovering {
      background: rgba(250, 173, 20, 0.1);
      color: #faad14;
      
      &.active {
        border-color: #faad14;
      }
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
