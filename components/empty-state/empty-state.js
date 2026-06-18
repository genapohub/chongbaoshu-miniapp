Component({
  properties: {
    icon:       { type: String, value: '' },
    text:       { type: String, value: '' },
    subText:    { type: String, value: '' },
    type:       { type: String, value: 'empty' },
    actionText: { type: String, value: '' },
  },

  data: {
    computedIcon: 'paw',
    computedIconColor: '#8F959E',
    computedText: '这里空空的',
  },

  observers: {
    'icon, type'() {
      // 飞书图标 + 颜色匹配
      const typeMap = {
        empty:     { icon: 'paw',         color: '#C0C4CC', text: '这里空空的' },
        error:     { icon: 'alert-circle', color: '#F54A45', text: '出了点问题' },
        network:   { icon: 'ban',         color: '#F7BA1E', text: '网络连接失败' },
        'no-pet':  { icon: 'paw',         color: '#3370FF', text: '还没有宠物' },
        'no-record': { icon: 'clipboard', color: '#8F959E', text: '还没有记录' },
      };

      const config = typeMap[this.data.type] || typeMap.empty;
      this.setData({
        computedIcon: this.data.icon || config.icon,
        computedIconColor: config.color,
        computedText: this.data.text || config.text,
      });
    },
  },

  methods: {
    onAction() {
      this.triggerEvent('action');
    },
  },
});
