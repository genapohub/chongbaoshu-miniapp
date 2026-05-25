Component({
  properties: {
    src: {
      type: String,
      value: ''
    },
    icon: {
      type: String,
      value: '🐾'
    },
    size: {
      type: String,
      value: 'md'
    },
    radius: {
      type: String,
      value: '16rpx'
    }
  },

  data: {
    imgFailed: false
  },

  methods: {
    onImgError() {
      this.setData({ imgFailed: true });
    }
  }
});
