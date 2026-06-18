Component({
  properties: {
    src:    { type: String, value: '' },
    icon:   { type: String, value: 'paw' },
    size:   { type: String, value: 'md' },
    radius: { type: String, value: '16rpx' },
  },

  data: {
    imgFailed: false,
    placeholderSize: '52',
  },

  observers: {
    size(val) {
      const map = { sm: '32', md: '52', lg: '56' };
      this.setData({ placeholderSize: map[val] || '52' });
    },
  },

  lifetimes: {
    attached() {
      const map = { sm: '32', md: '52', lg: '56' };
      this.setData({ placeholderSize: map[this.properties.size] || '52' });
    },
  },

  methods: {
    onImgError() {
      this.setData({ imgFailed: true });
    },
  },
});
