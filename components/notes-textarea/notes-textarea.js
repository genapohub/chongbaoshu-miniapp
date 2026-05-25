Component({
  properties: {
    value: { type: String, value: '' },
    placeholder: { type: String, value: '请输入备注' },
    maxlength: { type: Number, value: 500 },
  },
  data: {
    currentLength: 0,
  },
  observers: {
    'value': function(val) {
      this.setData({ currentLength: (val || '').length });
    },
  },
  methods: {
    onInput: function(e) {
      this.setData({ currentLength: e.detail.value.length });
      this.triggerEvent('input', { value: e.detail.value });
    },
  },
});
