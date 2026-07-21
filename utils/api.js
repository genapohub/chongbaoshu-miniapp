/**
 * API 请求封装
 * 统一处理 token、错误码、loading
 * 安全增强：GET 请求失败重试 + confirmDel 便捷方法
 * 监控增强：埋点 + Sentry 面包屑 + 异常捕获
 * 调用方式：生产环境使用 wx.cloud.callContainer（无需配置服务器域名）
 *          开发环境使用 wx.request（连接本地后端）
 */
const app = getApp();
const analytics = require('./analytics');
const sentry = require('./sentry');

// 判断是否为开发环境
const isDev = __wxConfig && __wxConfig.envVersion === 'develop';

/**
 * 通用请求方法（含 GET 请求失败重试机制）
 */
function request(options) {
  const url = options.url;
  const method = options.method || 'GET';
  const data = options.data;
  const loading = options.loading !== undefined ? options.loading : true;
  const loadingText = options.loadingText || '加载中...';
  const auth = options.auth !== false; // 默认携带 token

  // GET 请求最多重试 2 次，其他请求不重试
  const maxRetries = method === 'GET' ? 2 : 0;
  let retryCount = 0;

  function doRequest() {
    return new Promise(function(resolve, reject) {
      // 监控：记录请求开始时间
      const startTime = Date.now();

      if (loading) {
        wx.showLoading({ title: loadingText, mask: true });
      }

      const header = {
        'Content-Type': 'application/json',
      };

      // 携带 token（除非显式设置 auth: false）
      if (auth && app.globalData.token) {
        header.Authorization = `Bearer ${app.globalData.token}`;
      }

      // 监控：发送前添加 Sentry 面包屑
      sentry.addBreadcrumb('api', `${method} ${url}`);

      // 请求完成后的统一处理
      function onSuccess(res) {
        if (loading) wx.hideLoading();

        const responseData = res.data;

        // 成功
        if (responseData.code === 0) {
          resolve(responseData.data);
          return;
        }

        // 监控：业务错误上报
        const duration = Date.now() - startTime;
        analytics.apiError(url, responseData.code, responseData.message);
        sentry.addBreadcrumb('api_error', `${url} → code:${responseData.code}`, { duration: duration });

        // 未登录
        if (responseData.code === 1002) {
          wx.removeStorageSync('token');
          app.globalData.token = null;
          wx.showToast({ title: '请先登录', icon: 'none' });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/login/login' });
          }, 1500);
          reject(responseData);
          return;
        }

        // 限额弹窗
        if (responseData.code === 2001) {
          wx.showModal({
            title: '已达上限',
            content: responseData.message,
            confirmText: '升级订阅',
            cancelText: '知道了',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.navigateTo({ url: '/pages/subscription/subscription' });
              }
            },
          });
          reject(responseData);
          return;
        }

        // 其他错误
        wx.showToast({
          title: responseData.message || '请求失败',
          icon: 'none',
          duration: 2000,
        });
        reject(responseData);
      }

      function onFail(err) {
        if (loading) wx.hideLoading();

        // 监控：网络错误上报
        const duration = Date.now() - startTime;
        analytics.apiError(url, 'NETWORK_ERROR', err.errMsg);
        sentry.captureException(new Error(err.errMsg), { api_path: url, method: method });

        // GET 请求重试逻辑
        if (retryCount < maxRetries) {
          retryCount++;
          doRequest().then(resolve).catch(reject);
        } else {
          wx.showToast({
            title: '网络异常，请重试',
            icon: 'none',
          });
          reject(err);
        }
      }

      if (isDev) {
        // 开发环境：使用 wx.request 连接本地后端
        wx.request({
          url: `${app.globalData.baseUrl}${url}`,
          method,
          data,
          header,
          timeout: 15000,
          success: onSuccess,
          fail: onFail,
        });
      } else {
        // 生产环境：使用 wx.cloud.callContainer 调用云托管服务
        wx.cloud.callContainer({
          path: `/api${url}`,
          method,
          data,
          header,
          timeout: 15000,
          success: onSuccess,
          fail: onFail,
        });
      }
    });
  }

  return doRequest();
}

// 便捷方法
function get(url, data, options) {
  options = options || {};
  const params = { url: url, method: 'GET', data: data };
  for (let key in options) {
    params[key] = options[key];
  }
  return request(params);
}

function post(url, data, options) {
  options = options || {};
  const params = { url: url, method: 'POST', data: data };
  for (let key in options) {
    params[key] = options[key];
  }
  return request(params);
}

function put(url, data, options) {
  options = options || {};
  const params = { url: url, method: 'PUT', data: data };
  for (let key in options) {
    params[key] = options[key];
  }
  return request(params);
}

function del(url, data, options) {
  options = options || {};
  const params = { url: url, method: 'DELETE', data: data };
  for (let key in options) {
    params[key] = options[key];
  }
  return request(params);
}

/**
 * 删除确认便捷方法
 * 弹出确认弹窗后再执行删除请求
 * @param {string} url - 请求路径
 * @param {object} data - 请求数据
 * @param {object} options - 请求选项
 * @returns {Promise} 删除结果
 */
function confirmDel(url, data, options) {
  return new Promise(function(resolve, reject) {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      success: function(res) {
        if (res.confirm) {
          del(url, data, options).then(resolve).catch(reject);
        } else {
          reject(new Error('CANCELLED'));
        }
      },
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  confirmDel,
};
