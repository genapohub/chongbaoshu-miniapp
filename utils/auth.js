/**
 * 认证工具
 */
// formatDate 从 constants 引入仅供本模块内部使用（timeAgo），
// 不再 re-export——外部请直接 require('./constants').formatDate
const { formatDate } = require('./constants');
// getApp() 惰性获取：模块可能在 App 注册前被 require，顶层取会得到 undefined
let _app = null;
function app() {
  if (!_app) _app = getApp();
  return _app;
}

/**
 * 检查登录态，未登录跳转登录页
 * @returns {boolean} 是否已登录
 */
function checkAuth() {
  if (app().globalData.token) {
    return true;
  }
  wx.navigateTo({ url: '/pages/login/login' });
  return false;
}

/**
 * 计算距今天数
 */
function daysFromNow(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/**
 * 计算年龄
 */
function calcAge(birthDate) {
  if (!birthDate) return '';
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0) return `${years}岁${months > 0 ? months + '月' : ''}`;
  return `${months}个月`;
}

/**
 * 格式化提醒日期文案（如"今天"、"明天"、"3天后"）
 */
function formatReminderDate(dateStr) {
  if (!dateStr) return '';
  var days = daysFromNow(dateStr);
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days > 1 && days <= 7) return days + '天后';
  if (days < 0) return '已过期' + Math.abs(days) + '天';
  var d = new Date(dateStr);
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

/**
 * 相对时间格式化（"刚刚"、"5分钟前"、"昨天"等）
 */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  var now = Date.now();
  var date = new Date(dateStr);
  var diff = now - date.getTime();
  if (diff < 0) return '刚刚';

  var seconds = Math.floor(diff / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return minutes + '分钟前';
  if (hours < 24) return hours + '小时前';
  if (days === 1) return '昨天';
  if (days < 7) return days + '天前';
  return formatDate(dateStr);
}

module.exports = {
  checkAuth,
  daysFromNow,
  calcAge,
  formatReminderDate,
  timeAgo,
};
