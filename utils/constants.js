/**
 * 宠宝树 常量定义（飞书风格皮肤 V2）
 * 所有图标已迁移至飞书风格 SVG 图标系统，使用 icon name 而非 emoji
 */

// 物种（icon 为飞书图标名称，供 <icon> 组件使用）
const SPECIES = {
  dog: { label: '犬', icon: 'dog', gestation: 63 },
  cat: { label: '猫', icon: 'cat', gestation: 65 },
  bird: { label: '鸟', icon: 'bird', gestation: 28 },
  rabbit: { label: '兔', icon: 'rabbit', gestation: 31 },
  other: { label: '其他', icon: 'paw', gestation: 63 },
};

// 性别（icon 为飞书图标名称）
const GENDER = {
  male: { label: '公', icon: 'male' },
  female: { label: '母', icon: 'female' },
  unknown: { label: '未知', icon: 'help-circle' },
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
  pregnant: { label: '已怀孕', color: '#3370FF' },
  ultrasound_confirmed: { label: 'B超确认', color: '#9B51E0' },
  delivered: { label: '已分娩', color: '#2BA471' },
  weaned: { label: '已断奶', color: '#F2994A' },
  failed: { label: '未成功', color: '#F54A45' },
};

// 健康记录类型（icon 为飞书图标名称）
const HEALTH_TYPE = {
  vaccine: { label: '疫苗', icon: 'syringe', color: '#2D9CDB' },
  deworm: { label: '驱虫', icon: 'bug', color: '#2BA471' },
  checkup: { label: '体检', icon: 'activity-heart', color: '#F7BA1E' },
  illness: { label: '疾病', icon: 'alert-circle', color: '#F54A45' },
  other: { label: '其他', icon: 'clipboard', color: '#8F959E' },
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

// 订阅方案（icon 为飞书图标名称）
const SUBSCRIPTION_PLANS = {
  free: { name: '免费版', price: 0, period: '永久' },
  basic: { name: '基础版', price: 49, period: '月付' },
  pro: { name: 'Pro 专业版', price: 149, period: '月付' },
};

// 订阅方案完整信息（icon 为飞书图标名称，bg 为图标容器背景色）
const PLAN_DETAILS = {
  free: {
    tier: 'free',
    name: '免费版',
    desc: '3只宠物 · 基础功能',
    icon: 'paw',
    iconBg: '#EDEDEF',
    iconColor: '#8F959E',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlySave: 0,
  },
  basic: {
    tier: 'basic',
    name: '基础版',
    desc: '100只宠物 · 数据导出 · 优先提醒',
    icon: 'star',
    iconBg: '#EDF4EF',
    iconColor: '#4A8C5C',
    monthlyPrice: 49,
    yearlyPrice: 39,
    yearlySave: 120,
  },
  pro: {
    tier: 'pro',
    name: 'Pro 专业版',
    desc: '无限宠物 · 血统证书 · 专属客服',
    icon: 'diamond',
    iconBg: '#EDF4EF',
    iconColor: '#4A8C5C',
    monthlyPrice: 149,
    yearlyPrice: 119,
    yearlySave: 360,
    isPopular: true,
  },
};

// 功能对比表
const PLAN_FEATURES = [
  { name: '宠物数量', free: '3只', basic: '100只', pro: '无限' },
  { name: '照片/宠物', free: '3张', basic: '20张', pro: '无限' },
  { name: '配种记录', free: '3条', basic: '无限', pro: '无限' },
  { name: '健康档案', free: '✓', basic: '✓', pro: '✓' },
  { name: '数据导出', free: '✗', basic: '✓', pro: '✓' },
  { name: '血统证书', free: '✗', basic: '✗', pro: '✓' },
  { name: '近亲检测', free: '✗', basic: '✓', pro: '✓' },
  { name: '优先提醒', free: '✗', basic: '✓', pro: '✓' },
  { name: '专属客服', free: '✗', basic: '✗', pro: '✓' },
];

// 主题色（飞书风格）
// 暖森林色系 — 宠宝树 V1.1 设计语言
// Primary: Sage Sage绿（树、生长、血统脉络）
// Accent: 暖琥珀（宝、品质感、温暖）
const THEME = {
  primary: '#4A8C5C',       // 主色：鼠尾草绿
  primaryLight: '#6F9E7C',  // 主色浅
  primaryBg: '#EDF4EF',     // 主色超浅底
  accent: '#D4914A',        // 强调色：暖琥珀
  success: '#3D8B37',       // 成功：森林绿
  warning: '#E0903C',       // 警告：暖橙
  danger: '#D4534A',        // 危险：暖红
  info: '#5B9E8C',          // 信息：灰绿
  bgPage: '#F6F4F0',        // 页面背景：暖灰底
  bgCard: '#FFFFFF',        // 卡片背景
  textPrimary: '#2D2A26',   // 标题：暖黑
  textSecondary: '#5E5953', // 正文：暖灰
  textHint: '#948F89',      // 辅助文字
  textDisabled: '#C4C0BA',  // 禁用文字
  border: '#E8E5E0',        // 边框
  borderLight: '#F0EDE9',   // 浅边框
  borderRadius: '16rpx',
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
