Component({
  properties: {
    title: { type: String, value: '请选择' },
    items: { type: Array, value: [] },
    selectedValue: { type: String, value: '' },
    show: { type: Boolean, value: false },
  },
  methods: {
    onSelect: function(e) {
      const value = e.currentTarget.dataset.value;
      const index = e.currentTarget.dataset.index;
      const item = this.data.items[index] || {};
      this.triggerEvent('select', { value: value, item: item });
    },
    onClose: function() {
      this.triggerEvent('close');
    },
    onMaskTap: function() {
      this.triggerEvent('close');
    },
    onContentTap: function() {
      // 阻止冒泡到 mask
    },
  },
});
