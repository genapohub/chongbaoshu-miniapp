/**
 * 宠宝树 — 品牌VI设计规范常量
 * 统一管理颜色、字号、间距等设计令牌
 *
 * 使用方式：
 *   const { brand, colors, sizes } = require('../../constants/brand.js');
 */

module.exports = {
  // ── 品牌色 ──────────────────────────────────────────────
  brand: {
    primary: '#E94560',        // 主色（热情红）
    primaryLight: '#FD79A8',   // 主色浅色（粉红）
    primaryDark: '#C23151',    // 主色深色
    primaryBg: '#FFF0F3',      // 主色背景
    primaryGradient: 'linear-gradient(135deg, #E94560, #FD79A8)',
  },

  // ── 功能色 ──────────────────────────────────────────────
  colors: {
    success: '#10B981',        // 成功/在线
    successBg: '#ECFDF5',
    warning: '#F59E0B',        // 警告/待处理
    warningBg: '#FFFBEB',
    danger: '#EF4444',         // 危险/错误
    dangerBg: '#FEF2F2',
    info: '#3B82F6',           // 信息/链接
    infoBg: '#EFF6FF',

    // 文字层级
    textPrimary: '#111827',    // 主文字
    textSecondary: '#6B7280',  // 次要文字
    textPlaceholder: '#9CA3AF',// 占位文字
    textDisabled: '#D1D5DB',   // 禁用文字

    // 背景色
    bgPage: '#F8F9FA',          // 页面背景
    bgCard: '#FFFFFF',          // 卡片背景
    bgInput: '#F3F4F6',         // 输入框背景

    // 边框
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // 阴影
    shadowSm: '0 2rpx 12rpx rgba(0,0,0,0.04)',
    shadowMd: '0 4rpx 16rpx rgba(0,0,0,0.08)',
    shadowLg: '0 8rpx 24rpx rgba(233,69,96,0.15)',
  },

  // ── 字号 ────────────────────────────────────────────────
  fonts: {
    xs: '22rpx',    // 辅助说明
    sm: '24rpx',    // 标签、时间
    base: '28rpx',  // 正文
    md: '30rpx',    // 强调正文
    lg: '32rpx',    // 小标题
    xl: '36rpx',    // 页面标题
    xxl: '44rpx',   // 大标题
    display: '56rpx'// 展示型
  },

  // ── 间距（基于 4px 网格） ──────────────────────────────
  spacing: {
    xs: '8rpx',
    sm: '16rpx',
    md: '24rpx',
    lg: '32rpx',
    xl: '48rpx',
    xxl: '64rpx',
  },

  // ── 圆角 ────────────────────────────────────────────────
  radius: {
    sm: '8rpx',
    md: '12rpx',
    lg: '16rpx',
    xl: '24rpx',
    full: '9999rpx'
  },

  // ── 宠物状态色 ──────────────────────────────────────────
  petStatus: {
    healthy: { bg: '#ECFDF5', color: '#10B981' },     // 健康
    breeding: { bg: '#FFFBEB', color: '#F59E0B' },     // 配种中
    pregnant: { bg: '#FFF0F3', color: '#E94560' },     // 怀孕中
    retired: { bg: '#F3F4F6', color: '#9CA3AF' },      // 已退役
  }
};
