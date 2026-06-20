/**
 * 宠宝树 飞书风格 SVG 图标库
 *
 * 使用方式：
 *   const { icons } = require('../../constants/icons');
 *   <icon name="paw" size="48" color="#3370FF" />
 *
 * 图标规范：24x24 viewBox, stroke-width 2, round caps/joins
 */
const icons = {
  // ═══ 品牌/宠物 ═══
  paw: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 14c-2 0-3.5 2-3.5 4 0 1.5 1 3 3.5 3s3.5-1.5 3.5-3c0-2-1.5-4-3.5-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="10" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="10" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="4" cy="7" r="1.8" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="7" r="1.8" stroke="currentColor" stroke-width="2"/></svg>',

  // ═══ 通用操作 ═══
  plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 导航 ═══
  'chevron-right': '<svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'chevron-left': '<svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'chevron-down': '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'arrow-left': '<svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 首页/工作台 ═══
  bell: '<svg viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lightning: '<svg viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',

  // ═══ 繁育/健康 ═══
  heart: '<svg viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  syringe: '<svg viewBox="0 0 24 24" fill="none"><path d="M19 3l2 2-1 1-2-2 1-1zM4 20l6-6M14 10l-4 4M8 16l-4 4M22 2l-9 9M4 20l-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bug: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 8a4 4 0 014-4h4a4 4 0 014 4v4a6 6 0 01-12 0V8z" stroke="currentColor" stroke-width="2"/><path d="M8 4V2M16 4V2M6 8H2M22 8h-4M10 18v4M14 18v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  'activity-heart': '<svg viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 文档/证书 ═══
  document: '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" stroke-width="2"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2M7 21h10M12 17v4M8 3h8a2 2 0 012 2v5a6 6 0 01-12 0V5a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  medal: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="5" stroke="currentColor" stroke-width="2"/><path d="M9 13l-3 9 6-4 6 4-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 状态/提示 ═══
  warning: '<svg viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  ban: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M5.64 5.64l12.72 12.72" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  'alert-circle': '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  lightbulb: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M10 2h4a7 7 0 014 11.3V16a2 2 0 01-2 2H8a2 2 0 01-2-2v-2.7A7 7 0 0110 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 用户/个人 ═══
  user: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2"/></svg>',

  // ═══ 订阅/付费 ═══
  diamond: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 2h12l4 8-10 12L2 10l4-8zM2 10h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'credit-card': '<svg viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M1 10h22" stroke="currentColor" stroke-width="2"/></svg>',
  trending: '<svg viewBox="0 0 24 24" fill="none"><path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',

  // ═══ 社交/分享 ═══
  gift: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8M12 4v18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 4H8a3 3 0 00-3 3c0 2 1.5 3 3 3h4V4zM12 4h4a3 3 0 013 3c0 2-1.5 3-3 3h-4V4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M9 12h12.5M21.5 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" stroke-width="2"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  wechat: '<svg viewBox="0 0 24 24" fill="none"><path d="M8 14c4 0 7-2 7-6s-3-6-7-6-7 2-7 6c0 1.5.5 3 1.5 4L2 16l4-1c.6.2 1.3.3 2 .3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 13c3 0 5.5-1.5 5.5-4s-2.5-4-5.5-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="5.5" cy="8" r="0.8" fill="currentColor"/><circle cx="10" cy="8" r="0.8" fill="currentColor"/></svg>',
  announcement: '<svg viewBox="0 0 24 24" fill="none"><path d="M11 5.88V4h2v2M4.23 8.29l.97-1.74 1.73.97-.97 1.74M18.07 8.29l-.97-1.74-1.73.97.97 1.74M12 2v2M4 7l2 1M18 7l-2 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 22h8M12 18v4M7 11h10a4 4 0 014 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a4 4 0 014-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 数据/搜索 ═══
  search: '<svg viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',

  // ═══ 图片/媒体 ═══
  camera: '<svg viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2"/></svg>',

  // ═══ 删除/撤销 ═══
  trash: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none"><path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 性别 ═══
  male: '<svg viewBox="0 0 24 24" fill="none"><circle cx="10" cy="14" r="5" stroke="currentColor" stroke-width="2"/><path d="M22 2l-6 6M14 2h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  female: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="5" stroke="currentColor" stroke-width="2"/><path d="M12 14v7M9 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',

  // ═══ 树/族谱 ═══
  tree: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21V11M12 3v2M12 11L7 7M12 11l5-4M7 7L2 4M7 7v3M17 7l5-4M17 7v3M12 3L7 7h10L12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 其他 ═══
  phone: '<svg viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  tool: '<svg viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0L10.3 4.7a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l1.4-1.4z" stroke="currentColor" stroke-width="2"/><path d="M21 15a3 3 0 11-6 0 3 3 0 016 0zM8 20l4-10 4 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  celebration: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6L12 2zM2 10l1 3h3l-2 1.5 1 3-2.5-1.5L4 17.5l-1-3H0l2-1.5L1 10h1zM21 2l1 2h2l-1.5 1L23 7l-2-1L19 7l.5-2L18 4h2l1-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  money: '<svg viewBox="0 0 24 24" fill="none"><rect x="1" y="5" width="22" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M12 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke="currentColor" stroke-width="2"/><path d="M1 9h2M21 9h2M1 15h2M21 15h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  'broken-heart': '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 6l-2 5h4l-2 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  // ═══ 快捷入口专用 ═══
  'pet-add': '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M6 19c1-2.5 3-4 6-4s5 1.5 6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="5" r="3" fill="currentColor"/><path d="M17 3v4M15 5h4" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></svg>',
  'breeding-new': '<svg viewBox="0 0 24 24" fill="none"><path d="M8 14c0-1.5 1-3 3-3.5M16 14c0-1.5-1-3-3-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="18" r="3" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="18" r="3" stroke="currentColor" stroke-width="2"/><path d="M10 4l2-2 2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  'health-shield': '<svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'cert-tree': '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" stroke-width="2"/><path d="M12 7l-2 4h4l-2 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="18" r="4" fill="currentColor" opacity="0.2"/><path d="M16 18l1 1 2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',

  pregnant: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="3" stroke="currentColor" stroke-width="2"/><path d="M12 10v11M9 14h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 8c-3 0-5 2-5 5s2 5 5 5c0 0 0 0 0 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 2"/></svg>',
  qrcode: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><path d="M14 14h3v3M21 14v7h-7M17 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',

  // ═══ 物种 ═══
  dog: '<svg viewBox="0 0 24 24" fill="none"><path d="M8 12c-1.5-1-3-3-3-5 0-1 1-2 2-2s2 1 2 2M16 12c1.5-1 3-3 3-5 0-1-1-2-2-2s-2 1-2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="14" r="3" stroke="currentColor" stroke-width="2"/><path d="M5 19c1-3 3.5-5 7-5s6 2 7 5M12 7V5M8 8L6 7M16 8l2-1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  cat: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5c-1 0-2 1-2 2s1 2 2 2 2-1 2-2-1-2-2-2z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 11l2-3M20 11l-2-3M8 20c1-2 2.5-3 4-3s3 1 4 3M10 8L9 6M14 8l1-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  bird: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 12c0 4-3 7-7 7s-7-3-7-7 3-7 7-7 7 3 7 7z" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="10" r="1" fill="currentColor"/><path d="M7 10l-4 4M2 12l4-2M12 5l2-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  rabbit: '<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="14" rx="5" ry="4" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="2"/><path d="M9 7c0-2 1-4 3-4s3 2 3 4M7 13c-2 0-4 1-4 3s2 3 4 3M17 13c2 0 4 1 4 3s-2 3-4 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  certificate: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSIzIiB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHJ4PSIyIi8+PHBhdGggZD0iTTggMjFoOCIvPjxwYXRoIGQ9Ik05IDEybDIgMiA0LTQiLz48L3N2Zz4=',
};

/**
 * 将 SVG 转为 data URI（小程序兼容版）
 * 小程序 image 组件支持 data:image/svg+xml 格式
 * 使用 encodeURIComponent 而非 base64，避免小程序兼容问题
 */
function svgToUri(svg, color) {
  const colored = svg.replace(/currentColor/g, color || '#1F2329');
  // 编码 < 避免 XML 解析混淆；# 和 > 不编码，否则颜色值和标签闭合会失效
  return 'data:image/svg+xml,' + colored
    .replace(/</g, '%3C');
}

module.exports = { icons, svgToUri };
