<template>
  <view class="page">
    <NavBar title="血统证书" :showBack="true" />
    
    <view class="content">
      <view class="certificate-card">
        <view class="certificate-header">
          <text class="certificate-title">血统证书</text>
          <text class="certificate-subtitle">Pedigree Certificate</text>
        </view>
        
        <view class="certificate-body">
          <view class="pet-section">
            <image class="pet-photo" :src="pet.avatar || defaultAvatar" mode="aspectFill" />
            <view class="pet-info">
              <text class="pet-name">{{ pet.name }}</text>
              <text class="pet-breed">{{ pet.breed }}</text>
              <view class="pet-meta">
                <text>{{ pet.gender === 'male' ? '公' : '母' }}</text>
                <text>·</text>
                <text>{{ getAge(pet.birthDate) }}</text>
                <text>·</text>
                <text>{{ pet.color }}</text>
              </view>
            </view>
          </view>
          
          <view class="divider"></view>
          
          <view class="info-section">
            <view class="info-row">
              <text class="info-label">出生日期</text>
              <text class="info-value">{{ formatDate(pet.birthDate) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">注册编号</text>
              <text class="info-value">{{ pet.id.padStart(10, '0') }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">体重</text>
              <text class="info-value">{{ pet.weight ? pet.weight + ' kg' : '-' }}</text>
            </view>
          </view>
          
          <view class="divider"></view>
          
          <view class="parents-section">
            <text class="section-title">血统信息</text>
            <view class="parent-item">
              <text class="parent-label">父犬</text>
              <text class="parent-value">{{ fatherInfo.name }}</text>
              <text class="parent-breed">{{ fatherInfo.breed }}</text>
            </view>
            <view class="parent-item">
              <text class="parent-label">母犬</text>
              <text class="parent-value">{{ motherInfo.name }}</text>
              <text class="parent-breed">{{ motherInfo.breed }}</text>
            </view>
          </view>
          
          <view class="divider"></view>
          
          <view class="footer-section">
            <text class="footer-text">宠宝树宠物繁育管理系统</text>
            <text class="footer-date">签发日期：{{ formatDate(new Date()) }}</text>
          </view>
        </view>
        
        <view class="certificate-footer">
          <view class="qrcode">
            <text class="qrcode-icon">📱</text>
            <text class="qrcode-text">扫码验证</text>
          </view>
        </view>
      </view>
      
      <view class="action-btn" @click="shareCertificate">分享证书</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { getAge, formatDate, showToast } from '@/utils'

const defaultAvatar = 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cute%20pet%20avatar%20cartoon%20style&image_size=square'

const pet = reactive({
  id: '2024001',
  name: '旺财',
  breed: '金毛寻回犬',
  gender: 'male' as const,
  birthDate: '2022-06-15',
  avatar: '',
  color: '金黄色',
  weight: 25
})

const fatherInfo = reactive({
  name: '冠军之星',
  breed: '金毛寻回犬'
})

const motherInfo = reactive({
  name: '金色年华',
  breed: '金毛寻回犬'
})

function shareCertificate() {
  uni.showShareMenu({
    withShareTicket: true
  })
  showToast('已开启分享', 'success')
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

.certificate-card {
  background: #fff;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
  margin-bottom: $spacing-md;
}

.certificate-header {
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  padding: $spacing-xl;
  text-align: center;
  
  .certificate-title {
    display: block;
    font-size: $font-size-xxl;
    font-weight: bold;
    color: #fff;
  }
  
  .certificate-subtitle {
    display: block;
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.8);
    margin-top: $spacing-xs;
  }
}

.certificate-body {
  padding: $spacing-lg;
}

.pet-section {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
  
  .pet-photo {
    width: 160rpx;
    height: 160rpx;