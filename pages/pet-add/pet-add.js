const api = require('../../utils/api.js');

Page({
  data: {
    formData: {
      name: '',
      species: '',
      breed: '',
      gender: '',
      birth_date: '',
      color: '',
      chip_no: '',
      father_name: '',
      father_breed: '',
      mother_name: '',
      mother_breed: '',
      avatar: '',
    },
    speciesDisplay: {},
    showPedigree: false,
    showSpeciesPicker: false,
    speciesOptions: [
      { value: 'dog', label: '犬', icon: '🐕' },
      { value: 'cat', label: '猫', icon: '🐱' },
      { value: 'bird', label: '鸟', icon: '🐦' },
      { value: 'rabbit', label: '兔', icon: '🐰' },
      { value: 'other', label: '其他', icon: '🐾' },
    ],
    availableTags: ['纯种', '繁育', '赛级', '家养', '活泼', '温顺'],
    customTags: [],
    selectedTags: [],
    selectedTagsIndex: {},
    newTag: '',
  },

  onLoad(options) {
    console.log('Add Pet Page loaded:', options);
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value,
    });
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          'formData.avatar': tempFilePath,
        });
      },
      fail: () => {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  },

  showSpeciesPicker() {
    this.setData({ showSpeciesPicker: true });
  },

  hideSpeciesPicker() {
    this.setData({ showSpeciesPicker: false });
  },

  stopPropagation() {},

  selectSpecies(e) {
    const value = e.currentTarget.dataset.value;
    const speciesOption = this.data.speciesOptions.find(item => item.value === value);

    this.setData({
      'formData.species': value,
      speciesDisplay: speciesOption || {},
      showSpeciesPicker: false,
    });
  },

  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      'formData.gender': this.data.formData.gender === gender ? '' : gender,
    });
  },

  onBirthDateChange(e) {
    this.setData({
      'formData.birth_date': e.detail.value,
    });
  },

  togglePedigree() {
    this.setData({
      showPedigree: !this.data.showPedigree,
    });
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    console.log('点击标签:', tag);

    const selectedTagsIndex = { ...this.data.selectedTagsIndex };
    const selectedTags = [...this.data.selectedTags];

    if (selectedTagsIndex[tag]) {
      delete selectedTagsIndex[tag];
      const index = selectedTags.indexOf(tag);
      if (index > -1) {
        selectedTags.splice(index, 1);
      }
    } else {
      if (selectedTags.length < 5) {
        selectedTagsIndex[tag] = true;
        selectedTags.push(tag);
      } else {
        wx.showToast({ title: '最多选择5个标签', icon: 'none' });
        return;
      }
    }

    this.setData({ selectedTagsIndex, selectedTags });
    console.log('当前选中标签:', selectedTags);
  },

  onNewTagInput(e) {
    this.setData({
      newTag: e.detail.value,
    });
  },

  addCustomTag() {
    const newTag = this.data.newTag.trim();
    if (!newTag) {
      wx.showToast({ title: '请输入标签内容', icon: 'none' });
      return;
    }
    if (this.data.selectedTags.length >= 5) {
      wx.showToast({ title: '最多选择5个标签', icon: 'none' });
      return;
    }
    if (this.data.selectedTags.includes(newTag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }

    const customTags = [...this.data.customTags, newTag];
    const selectedTagsIndex = { ...this.data.selectedTagsIndex, [newTag]: true };
    const selectedTags = [...this.data.selectedTags, newTag];

    this.setData({ customTags, selectedTagsIndex, selectedTags, newTag: '' });
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  validateForm() {
    const { name, species } = this.data.formData;
    if (!name.trim()) {
      wx.showToast({ title: '请输入宠物名称', icon: 'none' });
      return false;
    }
    if (!species) {
      wx.showToast({ title: '请选择物种', icon: 'none' });
      return false;
    }
    return true;
  },

  async submitForm() {
    if (!this.validateForm()) return;

    try {
      const data = {
        ...this.data.formData,
        tags: this.data.selectedTags,
      };

      if (data.avatar) {
        delete data.avatar;
      }

      const result = await api.post('/pets', data);
      wx.showToast({ title: '添加成功', icon: 'success' });

      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    } catch (error) {
      console.error('添加宠物失败:', error);
    }
  },
});
