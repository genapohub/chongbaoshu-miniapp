Component({
  properties: {
    icon: {
      type: String,
      value: ''
    },
    text: {
      type: String,
      value: ''
    },
    subText: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'empty' // empty | error | network | no-pet | no-record
    },
    actionText: {
      type: String,
      value: ''
    }
  },

  data: {
    computedIcon: '',
    computedText: ''
  },

  observers: {
    'icon, type': function() {
      const typeMap = {
        empty: { icon: '🐾', text: '暂无数据' },
        error: { icon: '❌', text: '出了点问题' },
        network: { icon: '📡', text: '网络连接失败' },
        'no-pet': { icon: '🐕', text: '还没有宠物' },
        'no-record': { icon: '📋', text: '暂无记录' }
      };

      const config = typeMap[this.data.type] || typeMap.empty;
      this.setData({
        computedIcon: this.data.icon || config.icon,
        computedText: this.data.text || config.text
      });
    }
  },

  methods: {
    onAction() {
      this.triggerEvent('action');
    }
  }
});
