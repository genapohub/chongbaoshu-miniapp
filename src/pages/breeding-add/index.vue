<template>
  <view class="page">
    <NavBar title="添加配种" :showBack="true" />
    
    <view class="content">
      <view class="form-item">
        <text class="form-label">公犬 *</text>
        <picker :range="malePets" range-key="name" @change="onMaleChange">
          <view class="form-input picker">
            {{ selectedMale?.name || '请选择公犬' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">母犬 *</text>
        <picker :range="femalePets" range-key="name" @change="onFemaleChange">
          <view class="form-input picker">
            {{ selectedFemale?.name || '请选择母犬' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">配种日期 *</text>
        <picker mode="date" :value="form.breedingDate" @change="onBreedingDateChange">
          <view class="form-input picker">
            {{ form.breedingDate || '请选择配种日期' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">预产期</text>
        <picker mode="date" :value="form.expectedDeliveryDate" @change="onDeliveryDateChange">
          <view class="form-input picker">
            {{ form.expectedDeliveryDate || '请选择预产期' }}
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <view class="form-item">
        <text class="form-label">状态</text>
        <view class="status-options">
          <view 
            class="status-option pending" 
            :class="{ active: form.status === 'pending' }"
            @click="form.status = 'pending'"
          >
            进行中
          </view>
          <view 
            class="status-option completed" 
            :class="{ active: form.status === 'completed' }"
            @click="form.status = 'completed'"
          >
            已完成
          </view>
          <view 
            class="status-option cancelled" 
            :class="{ active: form.status === 'cancelled' }"
            @click="form.status = 'cancelled'"
          >
            已取消
          </view>
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea 
          class="form-textarea" 
          v-model="form.notes" 
          placeholder="请输入备注信息"
          :maxlength="500"
        />
      </view>
      
      <view class="submit-btn" @click="submitForm">保存</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { usePetStore } from '@/store/pet'
import { showToast } from '@/utils'

const petStore = usePetStore()

const malePets = computed(() => petStore.pets.filter(p => p.gender === 'male'))
const femalePets = computed(() => petStore.pets.filter(p => p.gender === 'female'))

const form = reactive({
  malePetId: '',
  femalePetId: '',
  breedingDate: '',
  expectedDeliveryDate: '',
  status: 'pending' as 'pending' | 'completed' | 'cancelled',
  notes: ''
})

const selectedMale = computed(() => malePets.value.find(p => p.id === form.malePetId))
const selectedFemale = computed(() => femalePets.value.find(p => p.id === form.femalePetId))

function onMaleChange(e: { detail: { value: number } }) {
  const index = e.detail.value
  if (malePets.value[index]) {
    form.malePetId = malePets.value[index].id
  }
}

function onFemaleChange(e: { detail: { value: number } }) {
  const index = e.detail.value
  if (femalePets.value[index]) {
    form.femalePetId = femalePets.value[index].id
  }
}

function onBreedingDateChange(e: { detail: { value: string } }) {
  form.breedingDate = e.detail.value
}

function onDeliveryDateChange(e: { detail: { value: string } }) {
  form.expectedDeliveryDate = e.detail.value
}

function submitForm() {
  if (!form.malePetId) {
    showToast('请选择公犬', 'none')
    return
  }
  if (!form.femalePetId) {
    showToast('请选择母犬', 'none')
    return
  }
  if (!form.breedingDate) {
    showToast('请选择配种日期', 'none')
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
    
    &.pending {
      background: rgba(64, 128, 255, 0.1);
      color: #4080ff;
      &.active { border-color: #4080ff; }
    }
    
    &.completed {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;
      &.active { border-color: #52c41a; }
    }
    
    &.cancelled {
      background: rgba(153, 153, 153, 0.1);
      color: #999;
      &.active { border-color: #999; }
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
