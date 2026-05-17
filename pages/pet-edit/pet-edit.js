/**
 * P5 编辑宠物页面 - 按设计稿一比一复刻
 */
const api = require('../../utils/api.js');

Page({
  data: {
    petId: null,
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
    this.setData({ petId: options.id });
    this.loadPetData();
  },

  async loadPetData() {
    const { petId } = this.data;
    if (!petId) return;

    try {
      const petRes = await api.get(`/pets/${petId}`);
      
      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      const birthDate = petRes.birth_date ? petRes.birth_date.split('T')[0] : '';
      const speciesDisplay = this.data.speciesOptions.find(
        item => item.value === petRes.species
      ) || {};
      const avatarUrl = petRes.photos?.[0]?.photo_url 
        ? `${baseUrl}${petRes.photos[0].photo_url}` 
        : '';

      this.setData({
        formData: {
          name: petRes.name || '',
          species: petRes.species || '',
          breed: petRes.breed || '',
          gender: petRes.gender || '',
          birth_date: birthDate,
          color: petRes.color || '',
          chip_no: petRes.chip_number || '',
          father_name: petRes.father_name || '',
          father_breed: petRes.father_breed || '',
          mother_name: petRes.mother_name || '',
          mother_breed: petRes.mother_breed || '',
          avatar: avatarUrl,
        },
        speciesDisplay,
        selectedTags: petRes.tags || [],
        selectedTagsIndex: (petRes.tags || []).reduce((acc, tag) => {
          acc[tag] = true;
          return acc;
        }, {}),
      });
    } catch (error) {
      console.error('加载宠物数据失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
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
      const { petId, formData, selectedTags } = this.data;

      const data = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        gender: formData.gender || null,
        birth_date: formData.birth_date || null,
        color: formData.color || null,
        chip_no: formData.chip_no || null,
        father_name: formData.father_name || null,
        father_breed: formData.father_breed || null,
        mother_name: formData.mother_name || null,
        mother_breed: formData.mother_breed || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
      };

      await api.put(`/pets/${petId}`, data);
      wx.showToast({ title: '修改成功', icon: 'success' });

      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    } catch (error) {
      console.error('修改宠物失败:', error);
      wx.showToast({ title: '修改失败', icon: 'none' });
    }
  },
});
