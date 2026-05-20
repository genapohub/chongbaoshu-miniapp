const api = require('../../utils/api.js');

Page({
  data: {
    content: '',
    contact: '',
    loading: false,
    canSubmit: false,
  },

  checkCanSubmit(content) {
    return content && content.trim().length >= 10;
  },

  onContentInput(e) {
    const content = e.detail.value;
    this.setData({
      content: content,
      canSubmit: this.checkCanSubmit(content)
    });
  },

  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    });
  },

  async onSubmit() {
    if (this.data.loading) return;

    const content = this.data.content.trim();
    
    if (!content) {
      wx.showToast({
        title: '请先填写内容',
        icon: 'none'
      });
      return;
    }

    if (content.length < 10) {
      wx.showToast({
        title: '反馈内容至少需要10个字符',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      await api.post('/feedback', {
        content: content,
        contact: this.data.contact.trim() || null
      });

      wx.showToast({
        title: '提交成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    } catch (error) {
      console.error('提交失败:', error);
      wx.showToast({
        title: error.message || '提交失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});