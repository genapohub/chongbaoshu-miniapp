const api = require('../../utils/api.js');
const analytics = require('../../utils/analytics');
const formHelpers = require('../../utils/form-helpers');

Page({
  data: {
    loading: false,
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
      grandfather_p_name: '',
      grandmother_p_name: '',
      mother_name: '',
      mother_breed: '',
      grandfather_m_name: '',
      grandmother_m_name: '',
      price: null,
      is_for_sale: false,
      role: '',
      avatar: '',
    },
    speciesDisplay: {},
    showPedigree: false,
    showSpeciesPicker: false,
    speciesOptions: formHelpers.getSpeciesOptions(),
    roleOptions: [
      { value: 'breeder', label: '种犬' },
      { value: 'for_sale', label: '在售' },
      { value: 'puppy', label: '幼崽' },
      { value: 'retired', label: '退役' },
    ],
    availableTags: ['纯种', '繁育', '赛级', '家养', '活泼', '温顺'],
    customTags: [],
    selectedTags: [],
    selectedTagsIndex: {},
    newTag: '',
  },

  onLoad: function(options) {
    // Page loaded
  },

  onInputChange: function(e) {
    formHelpers.onInputChange(this, e);
  },

  chooseAvatar: function() {
    formHelpers.chooseAvatar(this);
  },

  showSpeciesPicker: function() {
    this.setData({ showSpeciesPicker: true });
  },

  hideSpeciesPicker: function() {
    this.setData({ showSpeciesPicker: false });
  },

  onSpeciesSelect: function(e) {
    const value = e.detail.value;
    const item = e.detail.item;
    this.setData({
      'formData.species': value,
      speciesDisplay: item,
      showSpeciesPicker: false,
    });
  },

  selectGender: function(e) {
    const gender = e.currentTarget.dataset.gender;
    const currentGender = this.data.formData.gender;
    this.setData({
      'formData.gender': currentGender === gender ? '' : gender,
    });
  },

  selectRole: function(e) {
    const role = e.currentTarget.dataset.role;
    const currentRole = this.data.formData.role;
    this.setData({
      'formData.role': currentRole === role ? '' : role,
    });
  },

  onBirthDateChange: function(e) {
    this.setData({ 'formData.birth_date': e.detail.value });
  },

  togglePedigree: function() {
    this.setData({ showPedigree: !this.data.showPedigree });
  },

  toggleTag: function(e) {
    const tag = e.currentTarget.dataset.tag;
    const result = formHelpers.toggleTag(
      this.data.selectedTagsIndex, this.data.selectedTags, tag
    );
    if (result) this.setData(result);
  },

  onNewTagInput: function(e) {
    this.setData({ newTag: e.detail.value });
  },

  addCustomTag: function() {
    const result = formHelpers.addCustomTag(
      this.data.selectedTagsIndex, this.data.selectedTags,
      this.data.customTags, this.data.newTag
    );
    if (result) {
      this.setData(result);
      wx.showToast({ title: '添加成功', icon: 'success' });
    }
  },

  validateForm: function() {
    return formHelpers.validatePetForm(this.data.formData);
  },

  submitForm: function() {
    const that = this;
    if (that.data.loading) return;
    if (!that.validateForm()) return;

    that.setData({ loading: true });

    const formData = that.data.formData;
    const avatarPath = formData.avatar;
    const uploadData = formHelpers.buildUploadData(formData, that.data.selectedTags);
    // pet-add 独有：包含 role 字段
    uploadData.role = formData.role || '';
    uploadData.price = formData.price || null;
    uploadData.is_for_sale = formData.is_for_sale || false;

    if (avatarPath) {
      wx.uploadFile({
        url: getApp().globalData.baseUrl + '/pets',
        filePath: avatarPath,
        name: 'avatar',
        formData: uploadData,
        header: {
          'Authorization': 'Bearer ' + getApp().globalData.token,
          'Content-Type': 'multipart/form-data',
        },
        success: function(res) {
          try {
            const result = JSON.parse(res.data);
            if (result.code === 0) {
              analytics.petAdd(that.data.formData.species || 'other', 'manual');
              wx.showToast({ title: '添加成功', icon: 'success' });
              setTimeout(function() {
                wx.navigateBack({ delta: 1 });
              }, 1500);
            } else {
              wx.showToast({ title: result.detail || '添加失败', icon: 'none' });
            }
          } catch (e) {
            wx.showToast({ title: '添加失败', icon: 'none' });
          }
          that.setData({ loading: false });
        },
        fail: function() {
          wx.showToast({ title: '上传失败', icon: 'none' });
          that.setData({ loading: false });
        },
      });
    } else {
      api.post('/pets', uploadData).then(function() {
        analytics.petAdd(that.data.formData.species || 'other', 'manual');
        wx.showToast({ title: '添加成功', icon: 'success' });
        setTimeout(function() {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      }).catch(function() {
        wx.showToast({ title: '添加失败', icon: 'none' });
      }).finally(function() {
        that.setData({ loading: false });
      });
    }
  },
});
