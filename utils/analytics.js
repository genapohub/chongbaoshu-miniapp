/**
 * 数据埋点核心封装
 *
 * 基于 wx.reportAnalytics 实现事件上报，提供：
 * - EVENTS 常量：18 个事件名映射
 * - track() 通用方法
 * - 语义化便捷方法
 * - 参数校验、容错、开关控制
 */

/** 事件名常量映射 */
const EVENTS = {
  // 注册漏斗
  REGISTER_START: 'register_start',
  REGISTER_WX_AUTH: 'register_wx_auth',
  REGISTER_PHONE_AUTH: 'register_phone_auth',
  REGISTER_SUCCESS: 'register_success',

  // 付费漏斗
  PAY_ENTRY: 'pay_entry',
  PAY_PLAN_SELECT: 'pay_plan_select',
  PAY_CONFIRM: 'pay_confirm',
  PAY_SUCCESS: 'pay_success',
  PAY_FAIL: 'pay_fail',

  // 核心功能
  PET_ADD: 'pet_add',
  MATING_ADD: 'mating_add',
  HEALTH_ADD: 'health_add',
  PEDIGREE_VIEW: 'pedigree_view',

  // 邀请裂变
  INVITE_CODE_GET: 'invite_code_get',
  INVITE_SHARE: 'invite_share',
  INVITE_REDEEM: 'invite_redeem',
  INVITE_REWARD: 'invite_reward',

  // 通用
  PAGE_VIEW: 'page_view',
  API_ERROR: 'api_error',
};

/**
 * 埋点开关。开发环境可通过设置 enabled = false 关闭上报
 * 默认开启，若 wx.reportAnalytics 不可用则自动关闭
 */
let _enabled = true;

/**
 * 最大参数值长度（微信限制 256 字符）
 */
const MAX_PARAM_LENGTH = 256;

/**
 * 将参数值转为字符串并截断至最大长度
 * @param {*} value - 原始参数值
 * @returns {string} 处理后的字符串
 */
function _sanitizeValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.length > MAX_PARAM_LENGTH) {
    return str.substring(0, MAX_PARAM_LENGTH);
  }
  return str;
}

/**
 * 对参数对象做清洗：所有值转字符串并截断
 * @param {Object} params - 原始参数对象
 * @returns {Object} 清洗后的参数对象
 */
function _sanitizeParams(params) {
  if (!params || typeof params !== 'object') {
    return {};
  }
  const sanitized = {};
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      sanitized[key] = _sanitizeValue(params[key]);
    }
  }
  return sanitized;
}

/**
 * 通用埋点上报方法
 *
 * @param {string} eventName - 事件名，应来自 EVENTS 常量
 * @param {Object} [params={}] - 事件参数键值对
 */
function track(eventName, params) {
  if (!_enabled) {
    return;
  }
  try {
    if (typeof wx === 'undefined' || typeof wx.reportAnalytics !== 'function') {
      _enabled = false;
      return;
    }
    const sanitizedParams = _sanitizeParams(params);
    wx.reportAnalytics(eventName, sanitizedParams);
  } catch (err) {
    // 埋点失败不影响业务，静默处理
    console.warn('[analytics] track failed:', eventName, err);
  }
}

// ============================================================
// 注册漏斗便捷方法
// ============================================================

/**
 * 注册流程开始
 * @param {string} source - 入口来源（如 'page_login', 'invite_link'）
 */
function registerStart(source) {
  track(EVENTS.REGISTER_START, { source: source });
}

/**
 * 微信授权步骤
 */
function registerWxAuth() {
  track(EVENTS.REGISTER_WX_AUTH, {});
}

/**
 * 手机号授权步骤
 */
function registerPhoneAuth() {
  track(EVENTS.REGISTER_PHONE_AUTH, {});
}

/**
 * 注册成功
 * @param {string} method - 注册方式（如 'wx_phone', 'wx_only'）
 * @param {boolean|number} isNew - 是否新用户
 */
function registerSuccess(method, isNew) {
  track(EVENTS.REGISTER_SUCCESS, {
    method: method,
    is_new: isNew ? '1' : '0',
  });
}

// ============================================================
// 付费漏斗便捷方法
// ============================================================

/**
 * 进入付费页面
 * @param {string} trigger - 触发来源（如 'limit_popup', 'menu', 'pedigree'）
 * @param {string} currentPlan - 当前套餐（如 'free', 'basic'）
 */
function payEntry(trigger, currentPlan) {
  track(EVENTS.PAY_ENTRY, { trigger: trigger, current_plan: currentPlan });
}

/**
 * 选择套餐
 * @param {string|number} planId - 套餐 ID
 * @param {string} planName - 套餐名称
 * @param {string|number} price - 套餐价格
 */
function payPlanSelect(planId, planName, price) {
  track(EVENTS.PAY_PLAN_SELECT, {
    plan_id: planId,
    plan_name: planName,
    price: price,
  });
}

/**
 * 确认支付
 * @param {string|number} planId - 套餐 ID
 * @param {string|number} price - 套餐价格
 */
function payConfirm(planId, price) {
  track(EVENTS.PAY_CONFIRM, { plan_id: planId, price: price });
}

/**
 * 支付成功
 * @param {string|number} planId - 套餐 ID
 * @param {string|number} price - 支付金额
 * @param {string} payMethod - 支付方式（如 'wxpay'）
 */
function paySuccess(planId, price, payMethod) {
  track(EVENTS.PAY_SUCCESS, {
    plan_id: planId,
    price: price,
    pay_method: payMethod,
  });
}

/**
 * 支付失败
 * @param {string|number} planId - 套餐 ID
 * @param {string} failReason - 失败原因
 */
function payFail(planId, failReason) {
  track(EVENTS.PAY_FAIL, { plan_id: planId, fail_reason: failReason });
}

// ============================================================
// 核心功能便捷方法
// ============================================================

/**
 * 添加宠物
 * @param {string} petType - 宠物类型（如 'dog', 'cat'）
 * @param {string} source - 来源（如 'manual', 'import'）
 */
function petAdd(petType, source) {
  track(EVENTS.PET_ADD, { pet_type: petType, source: source });
}

/**
 * 发布配种
 * @param {string} petType - 宠物类型
 * @param {boolean|number} hasPhoto - 是否有照片
 */
function matingAdd(petType, hasPhoto) {
  track(EVENTS.MATING_ADD, {
    pet_type: petType,
    has_photo: hasPhoto ? '1' : '0',
  });
}

/**
 * 添加健康记录
 * @param {string} recordType - 记录类型（如 'vaccine', 'checkup', 'deworm'）
 */
function healthAdd(recordType) {
  track(EVENTS.HEALTH_ADD, { record_type: recordType });
}

/**
 * 查看族谱
 * @param {string|number} petId - 宠物 ID
 * @param {string|number} generationCount - 代数
 */
function pedigreeView(petId, generationCount) {
  track(EVENTS.PEDIGREE_VIEW, {
    pet_id: petId,
    generation_count: generationCount,
  });
}

// ============================================================
// 邀请裂变便捷方法
// ============================================================

/**
 * 获取邀请码
 */
function inviteCodeGet() {
  track(EVENTS.INVITE_CODE_GET, {});
}

/**
 * 分享邀请
 * @param {string} shareType - 分享类型（如 'poster', 'link', 'qrcode'）
 */
function inviteShare(shareType) {
  track(EVENTS.INVITE_SHARE, { share_type: shareType });
}

/**
 * 兑换邀请码
 * @param {string|number} inviterId - 邀请人 ID
 */
function inviteRedeem(inviterId) {
  track(EVENTS.INVITE_REDEEM, { inviter_id: inviterId });
}

/**
 * 邀请奖励到账
 * @param {string} rewardType - 奖励类型（如 'days', 'discount'）
 * @param {boolean|number} isInviter - 是否为邀请人（1=邀请人，0=受邀人）
 */
function inviteReward(rewardType, isInviter) {
  track(EVENTS.INVITE_REWARD, {
    reward_type: rewardType,
    is_inviter: isInviter ? '1' : '0',
  });
}

// ============================================================
// 通用便捷方法
// ============================================================

/**
 * 页面浏览
 * @param {string} pagePath - 页面路径
 * @param {string} [fromPath] - 来源页面路径
 * @param {string|number} [duration] - 停留时长（毫秒）
 */
function pageView(pagePath, fromPath, duration) {
  track(EVENTS.PAGE_VIEW, {
    page_path: pagePath,
    from_path: fromPath || '',
    duration: duration || 0,
  });
}

/**
 * API 错误上报
 * @param {string} apiPath - 接口路径
 * @param {string|number} errorCode - 错误码
 * @param {string} errorMsg - 错误信息
 */
function apiError(apiPath, errorCode, errorMsg) {
  track(EVENTS.API_ERROR, {
    api_path: apiPath,
    error_code: errorCode,
    error_msg: errorMsg,
  });
}

/**
 * 设置埋点开关
 * @param {boolean} enabled - 是否开启埋点
 */
function setEnabled(enabled) {
  _enabled = !!enabled;
}

/**
 * 设置用户属性到 Sentry scope（作为 tags）
 * 用于在 Sentry 事件中携带用户业务属性，方便按维度筛选
 *
 * @param {Object} props - 用户属性键值对
 * @param {string} [props.subscription_tier] - 订阅等级（如 'free', 'basic', 'pro'）
 * @param {string|number} [props.pet_count] - 宠物数量
 * @param {string} [props.kennel_name] - 犬舍名称（如有）
 */
function setUserProperties(props) {
  if (!props || typeof props !== 'object') {
    return;
  }
  try {
    const sentry = require('./sentry');
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const value = props[key];
        if (value !== null && value !== undefined) {
          sentry._addTag(key, String(value));
        }
      }
    }
  } catch (err) {
    console.warn('[analytics] setUserProperties failed:', err);
  }
}

module.exports = {
  EVENTS,
  track,
  // 注册漏斗
  registerStart,
  registerWxAuth,
  registerPhoneAuth,
  registerSuccess,
  // 付费漏斗
  payEntry,
  payPlanSelect,
  payConfirm,
  paySuccess,
  payFail,
  // 核心功能
  petAdd,
  matingAdd,
  healthAdd,
  pedigreeView,
  // 邀请裂变
  inviteCodeGet,
  inviteShare,
  inviteRedeem,
  inviteReward,
  // 通用
  pageView,
  apiError,
  setUserProperties,
  // 开关
  setEnabled,
};
