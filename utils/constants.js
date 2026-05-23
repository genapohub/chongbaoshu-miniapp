/**
 * 常量定义
 */

// 物种
const SPECIES = {
  dog: { label: '犬', icon: '🐕', gestation: 63 },
  cat: { label: '猫', icon: '🐈', gestation: 65 },
  bird: { label: '鸟', icon: '🐦', gestation: 28 },
  rabbit: { label: '兔', icon: '🐇', gestation: 31 },
  other: { label: '其他', icon: '🐾', gestation: 63 },
};

// 性别
const GENDER = {
  male: { label: '公', icon: '♂️' },
  female: { label: '母', icon: '♀️' },
  unknown: { label: '未知', icon: '?' },
};

// 宠物状态
const PET_STATUS = {
  active: { label: '在册', class: 'status-active' },
  breeding: { label: '繁育中', class: 'status-breeding' },
  pregnant: { label: '怀孕中', class: 'status-pregnant' },
  nursing: { label: '哺乳中', class: 'status-nursing' },
  sold: { label: '已出售', class: 'status-sold' },
  deceased: { label: '已离世', class: 'status-deceased' },
};

// 繁育状态
const BREEDING_STATUS = {
  mated: { label: '已配种', color: '#2D9CDB' },
  pregnant: { label: '已怀孕', color: '#E94560' },
  ultrasound_confirmed: { label: 'B超确认', color: '#9B51E0' },
  delivered: { label: '已分娩', color: '#00B894' },
  weaned: { label: '已断奶', color: '#F2994A' },
  failed: { label: '未成功', color: '#FF6B6B' },
};

// 健康记录类型
const HEALTH_TYPE = {
  vaccine: { label: '疫苗', icon: '💉', color: '#2D9CDB' },
  deworm: { label: '驱虫', icon: '💊', color: '#00B894' },
  checkup: { label: '体检', icon: '🏥', color: '#FDCB6E' },
  illness: { label: '疾病', icon: '🤒', color: '#FF6B6B' },
  other: { label: '其他', icon: '📋', color: '#999999' },
};

// 驱虫类型
const DEWORM_TYPE = {
  internal: '体内驱虫',
  external: '体外驱虫',
  both: '内外同驱',
};

// 订阅等级
const SUBSCRIPTION_TIER = {
  free: { label: '免费版', price: 0, maxPets: 3, maxPhotos: 3, maxBreeding: 3 },
  basic: { label: '基础版', price: 49, maxPets: 100, maxPhotos: 20, maxBreeding: 50 },
  pro: { label: '专业版', price: 149, maxPets: Infinity, maxPhotos: Infinity, maxBreeding: Infinity },
};

// 订阅方案（用于订阅管理页面显示）
const SUBSCRIPTION_PLANS = {
  free: { name: '免费版', price: 0, period: '永久' },
  basic: { name: '基础版', price: 49, period: '月付' },
  pro: { name: 'Pro 专业版', price: 149, period: '月付' },
};

// 订阅方案完整信息（含月付/年付价格，用于 plan-select / payment-confirm / change-plan）
const PLAN_DETAILS = {
  free: {
    tier: 'free',
    name: '免费版',
    desc: '3只宠物 · 基础功能',
    icon: '🔷',
    iconBg: '#F3F4F6',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlySave: 0,
  },
  basic: {
    tier: 'basic',
    name: '基础版',
    desc: '100只宠物 · 数据导出 · 优先提醒',
    icon: '⭐',
    iconBg: '#E3F2FD',
    monthlyPrice: 49,
    yearlyPrice: 39,
    yearlySave: 120,
  },
  pro: {
    tier: 'pro',
    name: 'Pro 专业版',
    desc: '无限宠物 · 血统证书 · 专属客服',
    icon: '💎',
    iconBg: '#FFE4E8',
    monthlyPrice: 149,
    yearlyPrice: 119,
    yearlySave: 360,
    isPopular: true,
  },
};

// 功能对比表（用于 plan-select / subscribe / change-plan）
const PLAN_FEATURES = [
  { name: '宠物数量', free: '3只', basic: '100只', pro: '无限' },
  { name: '照片/宠物', free: '3张', basic: '10张', pro: '20张' },
  { name: '配种记录', free: '3条', basic: '无限', pro: '无限' },
  { name: '健康档案', free: '✓', basic: '✓', pro: '✓' },
  { name: '数据导出', free: '✗', basic: '✓', pro: '✓' },
  { name: '血统证书', free: '✗', basic: '✗', pro: '✓' },
  { name: '近亲检测', free: '✗', basic: '✓', pro: '✓' },
  { name: '优先提醒', free: '✗', basic: '✓', pro: '✓' },
  { name: '专属客服', free: '✗', basic: '✗', pro: '✓' },
];

// 主题色
const THEME = {
  primary: '#E94560',
  success: '#00B894',
  warning: '#FDCB6E',
  danger: '#FF6B6B',
  info: '#2D9CDB',
  bgPage: '#F8F9FA',
  bgCard: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textHint: '#999999',
  borderRadius: '16rpx', // 8px = 16rpx
};

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

module.exports = {
  SPECIES,
  GENDER,
  PET_STATUS,
  BREEDING_STATUS,
  HEALTH_TYPE,
  DEWORM_TYPE,
  SUBSCRIPTION_TIER,
  SUBSCRIPTION_PLANS,
  PLAN_DETAILS,
  PLAN_FEATURES,
  THEME,
  formatDate,
  formatDateTime,
};
