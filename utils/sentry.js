/**
 * Sentry 客户端封装
 *
 * 基于 @sentry/miniprogram 实现异常监控，提供：
 * - init() 初始化
 * - setUser() 设置用户上下文
 * - captureException() 捕获异常
 * - addBreadcrumb() 添加面包屑
 * - captureMessage() 捕获消息
 *
 * 所有方法 try-catch 包裹，Sentry 失败不影响业务
 */

let Sentry = null;
try {
  Sentry = require('@sentry/miniprogram');
} catch (e) {
  console.warn('[Sentry] @sentry/miniprogram not available, error monitoring disabled');
}

/**
 * Sentry 初始化状态标记
 */
let _initialized = false;

/**
 * 根据微信小程序环境版本获取 Sentry environment 标识
 * @returns {string} environment 字符串
 */
function _getEnvironment() {
  try {
    const envVersion = __wxConfig && __wxConfig.envVersion;
    if (envVersion === 'develop') {
      return 'miniapp-development';
    }
    return 'miniapp-production';
  } catch (err) {
    return 'miniapp-development';
  }
}

/**
 * 初始化 Sentry SDK
 *
 * @param {Object} [options={}] - 初始化配置
 * @param {string} [options.dsn] - Sentry DSN，为空则不初始化
 * @param {string} [options.environment] - 环境标识，默认自动判断
 * @param {string} [options.release] - 版本号，默认 '1.0.0'
 * @param {number} [options.tracesSampleRate=0.1] - 性能追踪采样率
 */
function init(options) {
  if (!Sentry) {
    console.warn('[Sentry] SDK not loaded, skipping init');
    return;
  }
  options = options || {};
  try {
    const dsn = options.dsn || '';
    if (!dsn) {
      console.warn('[sentry] DSN is empty, Sentry will not be initialized');
      return;
    }

    const environment = options.environment || _getEnvironment();
    const release = options.release || '1.0.0';
    const tracesSampleRate = options.tracesSampleRate !== undefined
      ? options.tracesSampleRate
      : 0.1;

    Sentry.init({
      dsn: dsn,
      environment: environment,
      release: release,
      tracesSampleRate: tracesSampleRate,
    });

    _initialized = true;
    console.info('[sentry] initialized, env:', environment, ', release:', release);
  } catch (err) {
    console.warn('[sentry] init failed:', err);
  }
}

/**
 * 设置用户上下文
 *
 * @param {string|number} userId - 用户 ID
 * @param {Object} [userInfo={}] - 附加用户信息
 * @param {string} [userInfo.openid] - 微信 openid
 * @param {string} [userInfo.nickname] - 昵称
 * @param {string} [userInfo.phone] - 手机号（脱敏后传入）
 */
function setUser(userId, userInfo) {
  if (!_initialized) {
    return;
  }
  try {
    // userId 为 null 时清除用户上下文
    if (userId === null || userId === undefined) {
      Sentry.setUser(null);
      return;
    }
    const user = {
      id: String(userId),
    };
    if (userInfo && typeof userInfo === 'object') {
      if (userInfo.openid) {
        user.openid = String(userInfo.openid);
      }
      if (userInfo.nickname) {
        user.username = String(userInfo.nickname);
      }
      if (userInfo.phone) {
        user.phone = String(userInfo.phone);
      }
    }
    Sentry.setUser(user);
  } catch (err) {
    console.warn('[sentry] setUser failed:', err);
  }
}

/**
 * 捕获异常
 *
 * @param {Error} error - 异常对象
 * @param {Object} [tags={}] - 附加标签键值对
 */
function captureException(error, tags) {
  if (!_initialized) {
    return;
  }
  try {
    if (tags && typeof tags === 'object') {
      Sentry.withScope(function (scope) {
        for (const key in tags) {
          if (Object.prototype.hasOwnProperty.call(tags, key)) {
            scope.setTag(key, String(tags[key]));
          }
        }
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch (err) {
    console.warn('[sentry] captureException failed:', err);
  }
}

/**
 * 添加面包屑
 *
 * @param {string} category - 面包屑分类（如 'api', 'navigation', 'user'）
 * @param {string} message - 面包屑消息
 * @param {Object} [data={}] - 附加数据
 */
function addBreadcrumb(category, message, data) {
  if (!_initialized) {
    return;
  }
  try {
    const breadcrumb = {
      category: category || 'default',
      message: message || '',
      level: 'info',
    };
    if (data && typeof data === 'object') {
      breadcrumb.data = data;
    }
    Sentry.addBreadcrumb(breadcrumb);
  } catch (err) {
    console.warn('[sentry] addBreadcrumb failed:', err);
  }
}

/**
 * 捕获消息
 *
 * @param {string} message - 消息内容
 * @param {string} [level='info'] - 日志级别：'debug' | 'info' | 'warning' | 'error' | 'fatal'
 */
function captureMessage(message, level) {
  if (!_initialized) {
    return;
  }
  try {
    Sentry.captureMessage(message, level || 'info');
  } catch (err) {
    console.warn('[sentry] captureMessage failed:', err);
  }
}

/**
 * 设置全局 scope tag（持续生效直到被覆盖或清除）
 * 用于设置用户属性等需要持续关联的标签
 *
 * @param {string} key - tag 名称
 * @param {string} value - tag 值
 */
function _addTag(key, value) {
  if (!_initialized) {
    return;
  }
  try {
    Sentry.setTag(key, value);
  } catch (err) {
    console.warn('[sentry] _addTag failed:', err);
  }
}

/**
 * 配置全局 scope（设置 tags、extras 等，持续生效）
 * 可用于批量设置用户属性
 *
 * @param {Function} callback - 接收 scope 对象的回调函数
 * @example
 *   sentry.configureScope(function(scope) {
 *     scope.setTag('subscription_tier', 'pro');
 *     scope.setExtra('pet_count', 5);
 *   });
 */
function configureScope(callback) {
  if (!_initialized) {
    return;
  }
  try {
    Sentry.configureScope(callback);
  } catch (err) {
    console.warn('[sentry] configureScope failed:', err);
  }
}

module.exports = {
  init,
  setUser,
  captureException,
  addBreadcrumb,
  captureMessage,
  _addTag,
  configureScope,
};
