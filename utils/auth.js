/**
 * 认证工具
 */
const app = getApp();
const { formatDate } = require('./constants');

/**
 * 检查登录态，未登录跳转登录页
 * @returns {boolean} 是否已登录
 */
function checkAuth() {
  if (app.globalData.token) {
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

module.exports = {
  checkAuth,
  formatDate,
  daysFromNow,
  calcAge,
};
