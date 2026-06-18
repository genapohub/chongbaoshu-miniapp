/**
 * 宠宝树 — 品牌VI设计规范常量（飞书风格皮肤）
 * 统一管理颜色、字号、间距等设计令牌
 *
 * 使用方式：
 *   const { brand, colors, sizes } = require('../../constants/brand.js');
 */

module.exports = {
  // ── 品牌色（飞书蓝系） ──────────────────────────────────
  brand: {
    primary: '#3370FF',        // 主色（飞书蓝）
    primaryLight: '#5B8DEF',   // 主色浅色（浅蓝）
    primaryDark: '#245BDB',    // 主色深色
    primaryBg: '#E8F0FE',      // 主色背景
    primaryGradient: 'linear-gradient(135deg, #3370FF, #5B8DEF)',
  },

  // ── 功能色 ──────────────────────────────────────────────
  colors: {
    success: '#2BA471',        // 成功/在线
    successBg: '#E8F8F0',
    warning: '#F7BA1E',        // 警告/待处理
    warningBg: '#FFF8E1',
    danger: '#F54A45',         // 危险/错误
    dangerBg: '#FEF0EF',
    info: '#3370FF',           // 信息/链接
    infoBg: '#E8F0FE',

    // 文字层级
    textPrimary: '#1F2329',    // 主文字
    textSecondary: '#646A73',  // 次要文字
    textPlaceholder: '#8F959E',// 占位文字
    textDisabled: '#C0C4CC',   // 禁用文字

    // 背景色
    bgPage: '#F5F6FA',          // 页面背景
    bgCard: '#FFFFFF',          // 卡片背景
    bgInput: '#F5F6FA',         // 输入框背景

    // 边框
    border: '#DEE0E3',
    borderLight: '#EDEDEF',

    // 阴影
    shadowSm: '0 2rpx 12rpx rgba(0,0,0,0.04)',
    shadowMd: '0 4rpx 16rpx rgba(0,0,0,0.08)',
    shadowLg: '0 8rpx 24rpx rgba(51,112,255,0.15)',
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
    healthy:  { bg: '#E8F8F0', color: '#2BA471' },
    breeding: { bg: '#FFF8E1', color: '#F7BA1E' },
    pregnant: { bg: '#E8F0FE', color: '#3370FF' },
    retired:  { bg: '#EDEDEF', color: '#8F959E' },
  },

  // ── 图标系统（飞书风格） ──────────────────────────────
  icons: {
    // 图标尺寸（rpx）
    xs: '24',    // 小图标（标签内、行内）
    sm: '32',    // 常规图标（表单字段、列表项）
    md: '40',    // 中等图标（卡片标题、按钮）
    lg: '48',    // 大图标（头像、弹窗）
    xl: '64',    // 超大图标（成功/失败状态）
    xxl: '96',   // 展示用（登录页Logo）

    // 图标容器颜色（飞书风格圆形背景图标）
    bgBlue:    '#E8F0FE',
    bgGreen:   '#E8F8F0',
    bgYellow:  '#FFF8E1',
    bgRed:     '#FEF0EF',
    bgPurple:  '#F0E8FE',
    bgGray:    '#F5F6FA',
  }
};
