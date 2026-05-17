/**
 * API 请求封装
 * 统一处理 token、错误码、loading
 */
const app = getApp();

/**
 * 通用请求方法
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, loading = true, loadingText = '加载中...' } = options;

    if (loading) {
      wx.showLoading({ title: loadingText, mask: true });
    }

    const header = {
      'Content-Type': 'application/json',
    };

    // 携带 token
    if (app.globalData.token) {
      header.Authorization = `Bearer ${app.globalData.token}`;
    }

    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header,
      success: (res) => {
        if (loading) wx.hideLoading();

        const responseData = res.data;

        // 成功
        if (responseData.code === 0) {
          resolve(responseData.data);
          return;
        }

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
      },
      fail: (err) => {
        if (loading) wx.hideLoading();
        wx.showToast({
          title: '网络异常，请重试',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

// 便捷方法
function get(url, data, options = {}) {
  return request({ url, method: 'GET', data, ...options });
}

function post(url, data, options = {}) {
  return request({ url, method: 'POST', data, ...options });
}

function put(url, data, options = {}) {
  return request({ url, method: 'PUT', data, ...options });
}

function del(url, data, options = {}) {
  return request({ url, method: 'DELETE', data, ...options });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
};
