const api = require('../../utils/api');

Page({
  data: {
    breedingId: null,
    breeding: {},
    statusText: '',
    statusType: 'gray',
    statusOptions: [
      { value: 'mated', label: '已配种', desc: '记录配种日期', icon: '💕' },
      { value: 'pregnant', label: '已怀孕', desc: '确认受孕状态', icon: '🤰' },
      { value: 'ultrasound_confirmed', label: '孕检确认', desc: 'B超检查确认', icon: '🔬' },
      { value: 'delivered', label: '已分娩', desc: '记录分娩信息', icon: '👶' },
      { value: 'weaned', label: '已断奶', desc: '幼崽断奶完成', icon: '🍼' },
      { value: 'failed', label: '未成功', desc: '繁育未成功', icon: '❌' },
    ],
  },

  onLoad(options) {
    this.setData({ breedingId: options.id });
    this.loadData();
  },

  async loadData() {
    const { breedingId } = this.data;
    if (!breedingId) return;

    try {
      const res = await api.get(`/breeding/${breedingId}`);
      const breeding = res;

      this.setData({
        breeding: {
          ...breeding,
          mating_date: breeding.mating_date?.split('T')[0] || '',
          due_date: breeding.due_date?.split('T')[0] || '',
          ultrasound_date: breeding.ultrasound_date?.split('T')[0] || '',
          delivery_date: breeding.delivery_date?.split('T')[0] || '',
        },
        statusText: this.getStatusText(breeding.status),
        statusType: this.getStatusType(breeding.status),
      });
    } catch (err) {
      console.error('加载繁育详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  getStatusText(status) {
    const map = {
      mated: '已配种',
      pregnant: '怀孕中',
      ultrasound_confirmed: '孕检确认',
      delivered: '已分娩',
      weaned: '已断奶',
      failed: '未成功',
    };
    return map[status] || status;
  },

  getStatusType(status) {
    const map = {
      mated: 'gray',
      pregnant: 'orange',
      ultrasound_confirmed: 'orange',
      delivered: 'green',
      weaned: 'green',
      failed: 'red',
    };
    return map[status] || 'gray';
  },

  updateStatus(e) {
    const newStatus = e.currentTarget.dataset.status;
    const { breeding, statusOptions } = this.data;

    if (newStatus === breeding.status) return;

    const currentIndex = statusOptions.findIndex(s => s.value === breeding.status);
    const newIndex = statusOptions.findIndex(s => s.value === newStatus);

    if (newIndex <= currentIndex && newStatus !== 'failed') {
      wx.showToast({ title: '请按顺序更新状态', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认更新',
      content: `确认将此记录状态更新为"${this.getStatusText(newStatus)}"？`,
      success: async (res) => {
        if (res.confirm) {
          await this.doUpdateStatus(newStatus);
        }
      },
    });
  },

  async doUpdateStatus(status) {
    try {
      wx.showLoading({ title: '更新中...', mask: true });

      await api.put(`/breeding/${this.data.breedingId}/status`, { status });

      wx.showToast({ title: '更新成功', icon: 'success' });

      this.loadData();
    } catch (err) {
      console.error('更新状态失败:', err);
      wx.showToast({ title: '更新失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  editBreeding() {
    wx.navigateTo({
      url: `/pages/breeding-add/breeding-add?id=${this.data.breedingId}`,
    });
  },

  deleteBreeding() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条繁育记录吗？',
      confirmText: '删除',
      confirmColor: '#C62828',
      success: async (res) => {
        if (res.confirm) {
          await this.doDelete();
        }
      },
    });
  },

  async doDelete() {
    try {
      wx.showLoading({ title: '删除中...', mask: true });

      await api.del(`/breeding/${this.data.breedingId}`);

      wx.showToast({ title: '删除成功', icon: 'success' });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('删除失败:', err);
      wx.showToast({ title: '删除失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },
});
