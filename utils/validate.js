/**
 * 通用输入校验与 XSS 过滤工具
 */

/**
 * XSS 过滤：转义 HTML 特殊字符
 * @param {*} str - 需要转义的字符串
 * @returns {*} 转义后的字符串，非字符串原样返回
 */
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * 检查字符串是否包含潜在 XSS 内容
 * @param {*} str - 需要检查的字符串
 * @returns {boolean} 是否包含 XSS 风险内容
 */
function hasXSS(str) {
  if (typeof str !== 'string') return false;
  return /<script|javascript:|on\w+\s*=|data:\s*text\/html/i.test(str);
}

/**
 * 手机号校验（中国大陆手机号）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否为合法手机号
 */
function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 字符串长度校验
 * @param {string} str - 需要校验的字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean} 是否在合法长度范围内
 */
function isValidLength(str, min, max) {
  if (!str) return min === 0;
  const len = str.trim().length;
  return len >= min && len <= max;
}

module.exports = {
  sanitize,
  hasXSS,
  isValidPhone,
  isValidLength,
};
