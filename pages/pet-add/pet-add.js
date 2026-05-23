var api = require('../../utils/api.js');

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
      role: '',
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
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value;
    var obj = {};
    obj['formData.' + field] = value;
    this.setData(obj);
  },

  chooseAvatar: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var tempFilePath = res.tempFilePaths[0];
        that.setData({
          'formData.avatar': tempFilePath,
        });
      },
      fail: function() {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  },

  showSpeciesPicker: function() {
    this.setData({ showSpeciesPicker: true });
  },

  hideSpeciesPicker: function() {
    this.setData({ showSpeciesPicker: false });
  },

  stopPropagation: function() {},

  selectSpecies: function(e) {
    var value = e.currentTarget.dataset.value;
    var speciesOptions = this.data.speciesOptions;
    var speciesOption = {};
    for (var i = 0; i < speciesOptions.length; i++) {
      if (speciesOptions[i].value === value) {
        speciesOption = speciesOptions[i];
        break;
      }
    }

    this.setData({
      'formData.species': value,
      speciesDisplay: speciesOption,
      showSpeciesPicker: false,
    });
  },

  selectGender: function(e) {
    var gender = e.currentTarget.dataset.gender;
    var currentGender = this.data.formData.gender;
    var newGender = currentGender === gender ? '' : gender;
    this.setData({
      'formData.gender': newGender,
    });
  },

  selectRole: function(e) {
    var role = e.currentTarget.dataset.role;
    var currentRole = this.data.formData.role;
    var newRole = currentRole === role ? '' : role;
    this.setData({
      'formData.role': newRole,
    });
  },

  onBirthDateChange: function(e) {
    this.setData({
      'formData.birth_date': e.detail.value,
    });
  },

  togglePedigree: function() {
    this.setData({
      showPedigree: !this.data.showPedigree,
    });
  },

  toggleTag: function(e) {
    var tag = e.currentTarget.dataset.tag;

    var selectedTagsIndex = {};
    var oldIndex = this.data.selectedTagsIndex;
    var oldKeys = Object.keys(oldIndex);
    for (var i = 0; i < oldKeys.length; i++) {
      var key = oldKeys[i];
      selectedTagsIndex[key] = oldIndex[key];
    }

    var selectedTags = this.data.selectedTags.slice();

    if (selectedTagsIndex[tag]) {
      delete selectedTagsIndex[tag];
      var index = selectedTags.indexOf(tag);
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

    this.setData({ selectedTagsIndex: selectedTagsIndex, selectedTags: selectedTags });
  },

  onNewTagInput: function(e) {
    this.setData({
      newTag: e.detail.value,
    });
  },

  addCustomTag: function() {
    var newTag = this.data.newTag.trim();
    if (!newTag) {
      wx.showToast({ title: '请输入标签内容', icon: 'none' });
      return;
    }
    if (this.data.selectedTags.length >= 5) {
      wx.showToast({ title: '最多选择5个标签', icon: 'none' });
      return;
    }
    var hasTag = false;
    for (var i = 0; i < this.data.selectedTags.length; i++) {
      if (this.data.selectedTags[i] === newTag) {
        hasTag = true;
        break;
      }
    }
    if (hasTag) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }

    var customTags = this.data.customTags.slice();
    customTags.push(newTag);

    var selectedTagsIndex = {};
    var oldIndex = this.data.selectedTagsIndex;
    var oldKeys = Object.keys(oldIndex);
    for (var j = 0; j < oldKeys.length; j++) {
      var key = oldKeys[j];
      selectedTagsIndex[key] = oldIndex[key];
    }
    selectedTagsIndex[newTag] = true;

    var selectedTags = this.data.selectedTags.slice();
    selectedTags.push(newTag);

    this.setData({ 
      customTags: customTags, 
      selectedTagsIndex: selectedTagsIndex, 
      selectedTags: selectedTags, 
      newTag: '' 
    });
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  validateForm: function() {
    var name = this.data.formData.name;
    var species = this.data.formData.species;
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

  submitForm: function() {
    var that = this;
    if (that.data.loading) return;
    if (!that.validateForm()) return;

    that.setData({ loading: true });

    var formData = that.data.formData;
    var avatarPath = formData.avatar;

    var uploadData = {
      name: formData.name,
      species: formData.species,
      breed: formData.breed || '',
      gender: formData.gender || '',
      birth_date: formData.birth_date || '',
      color: formData.color || '',
      chip_no: formData.chip_no || '',
      father_name: formData.father_name || '',
      father_breed: formData.father_breed || '',
      grandfather_p_name: formData.grandfather_p_name || '',
      grandmother_p_name: formData.grandmother_p_name || '',
      mother_name: formData.mother_name || '',
      mother_breed: formData.mother_breed || '',
      grandfather_m_name: formData.grandfather_m_name || '',
      grandmother_m_name: formData.grandmother_m_name || '',
      role: formData.role || '',
      tags: that.data.selectedTags.join(','),
    };

    if (avatarPath) {
      wx.uploadFile({
        url: getApp().globalData.baseUrl + '/pets',
        filePath: avatarPath,
        name: 'avatar',
        formData: uploadData,
        header: {
          'Authorization': 'Bearer ' + getApp().globalData.token,
          'Content-Type': 'multipart/form-data'
        },
        success: function(res) {
          try {
            var result = JSON.parse(res.data);
            if (result.code === 0) {
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
        fail: function(error) {
          wx.showToast({ title: '上传失败', icon: 'none' });
          that.setData({ loading: false });
        }
      });
    } else {
      api.post('/pets', uploadData).then(function(result) {
        wx.showToast({ title: '添加成功', icon: 'success' });
        setTimeout(function() {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      }).catch(function(error) {
        wx.showToast({ title: '添加失败', icon: 'none' });
      }).finally(function() {
        that.setData({ loading: false });
      });
    }
  },
});
