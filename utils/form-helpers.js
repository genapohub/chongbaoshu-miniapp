/**
 * 表单公共逻辑工具
 * 从 pet-add/pet-edit 提取的共享表单处理函数
 */
const constants = require('./constants');
const validate = require('./validate');

/**
 * 通用输入变更处理
 * @param {Object} page - Page 实例 (this)
 * @param {Object} e - 事件对象
 */
function onInputChange(page, e) {
  const field = e.currentTarget.dataset.field;
  const value = e.detail.value;
  const obj = {};
  obj['formData.' + field] = value;
  page.setData(obj);
}

/**
 * 通用头像选择
 * @param {Object} page - Page 实例 (this)
 */
function chooseAvatar(page) {
  wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: function(res) {
      page.setData({ 'formData.avatar': res.tempFilePaths[0] });
    },
    fail: function() {
      wx.showToast({ title: '选择图片失败', icon: 'none' });
    },
  });
}

/**
 * 标签切换（纯函数，返回新状态或 null）
 * @param {Object} selectedTagsIndex - 当前选中标签索引
 * @param {Array} selectedTags - 当前选中标签列表
 * @param {string} tag - 要切换的标签
 * @param {number} maxCount - 最大可选数量
 * @returns {Object|null} { selectedTagsIndex, selectedTags } 或 null（超限时）
 */
function toggleTag(selectedTagsIndex, selectedTags, tag, maxCount) {
  maxCount = maxCount || 5;
  const newIndex = Object.assign({}, selectedTagsIndex);
  const newTags = selectedTags.slice();

  if (newIndex[tag]) {
    delete newIndex[tag];
    const idx = newTags.indexOf(tag);
    if (idx > -1) newTags.splice(idx, 1);
  } else {
    if (newTags.length >= maxCount) {
      wx.showToast({ title: '最多选择' + maxCount + '个标签', icon: 'none' });
      return null;
    }
    newIndex[tag] = true;
    newTags.push(tag);
  }

  return { selectedTagsIndex: newIndex, selectedTags: newTags };
}

/**
 * 添加自定义标签（纯函数，返回新状态或 null）
 * @param {Object} selectedTagsIndex - 当前选中标签索引
 * @param {Array} selectedTags - 当前选中标签列表
 * @param {Array} customTags - 当前自定义标签列表
 * @param {string} newTag - 新标签文本
 * @param {number} maxCount - 最大可选数量
 * @returns {Object|null} { selectedTagsIndex, selectedTags, customTags, newTag: '' } 或 null
 */
function addCustomTag(selectedTagsIndex, selectedTags, customTags, newTag, maxCount) {
  maxCount = maxCount || 5;
  newTag = (newTag || '').trim();

  if (!newTag) {
    wx.showToast({ title: '请输入标签内容', icon: 'none' });
    return null;
  }
  if (selectedTags.length >= maxCount) {
    wx.showToast({ title: '最多选择' + maxCount + '个标签', icon: 'none' });
    return null;
  }
  if (selectedTags.indexOf(newTag) > -1) {
    wx.showToast({ title: '标签已存在', icon: 'none' });
    return null;
  }

  const newCustom = customTags.slice();
  newCustom.push(newTag);
  const newIndex = Object.assign({}, selectedTagsIndex);
  newIndex[newTag] = true;
  const newTags = selectedTags.slice();
  newTags.push(newTag);

  return { selectedTagsIndex: newIndex, selectedTags: newTags, customTags: newCustom, newTag: '' };
}

/**
 * 宠物表单校验
 * @param {Object} formData - 表单数据
 * @returns {boolean} 是否通过
 */
function validatePetForm(formData) {
  const name = (formData.name || '').trim();
  if (!name) {
    wx.showToast({ title: '请输入宠物名称', icon: 'none' });
    return false;
  }
  if (name.length > 20) {
    wx.showToast({ title: '名称最多20个字符', icon: 'none' });
    return false;
  }
  if (validate.hasXSS(name)) {
    wx.showToast({ title: '名称包含非法字符', icon: 'none' });
    return false;
  }
  if (!formData.species) {
    wx.showToast({ title: '请选择物种', icon: 'none' });
    return false;
  }
  if (formData.chip_no && formData.chip_no.length > 30) {
    wx.showToast({ title: '芯片号最多30个字符', icon: 'none' });
    return false;
  }
  const nameFields = ['father_name', 'mother_name', 'grandfather_p_name', 'grandmother_p_name', 'grandfather_m_name', 'grandmother_m_name'];
  for (let i = 0; i < nameFields.length; i++) {
    const field = nameFields[i];
    if (formData[field] && formData[field].length > 20) {
      wx.showToast({ title: '血统名称最多20个字符', icon: 'none' });
      return false;
    }
  }
  return true;
}

/**
 * 构建提交数据（sanitize）
 * @param {Object} formData - 原始表单数据
 * @param {Array} selectedTags - 选中标签
 * @returns {Object} 清洗后的提交数据
 */
function buildUploadData(formData, selectedTags) {
  return {
    name: validate.sanitize(formData.name),
    species: formData.species,
    breed: validate.sanitize(formData.breed || ''),
    gender: formData.gender || '',
    birth_date: formData.birth_date || '',
    color: validate.sanitize(formData.color || ''),
    chip_no: validate.sanitize(formData.chip_no || ''),
    father_name: validate.sanitize(formData.father_name || ''),
    father_breed: validate.sanitize(formData.father_breed || ''),
    grandfather_p_name: validate.sanitize(formData.grandfather_p_name || ''),
    grandmother_p_name: validate.sanitize(formData.grandmother_p_name || ''),
    mother_name: validate.sanitize(formData.mother_name || ''),
    mother_breed: validate.sanitize(formData.mother_breed || ''),
    grandfather_m_name: validate.sanitize(formData.grandfather_m_name || ''),
    grandmother_m_name: validate.sanitize(formData.grandmother_m_name || ''),
    tags: selectedTags.length > 0 ? selectedTags.join(',') : '',
  };
}

/**
 * 从 constants.SPECIES 生成 picker 选项数组
 * @returns {Array} [{value, label, icon}]
 */
function getSpeciesOptions() {
  const keys = Object.keys(constants.SPECIES);
  const options = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const info = constants.SPECIES[key];
    options.push({ value: key, label: info.label, icon: info.icon });
  }
  return options;
}

/**
 * 查找物种展示信息
 * @param {Array} speciesOptions - 物种选项数组
 * @param {string} value - 物种值
 * @returns {Object} 匹配的选项对象
 */
function findSpeciesDisplay(speciesOptions, value) {
  for (let i = 0; i < speciesOptions.length; i++) {
    if (speciesOptions[i].value === value) {
      return speciesOptions[i];
    }
  }
  return {};
}

module.exports = {
  onInputChange,
  chooseAvatar,
  toggleTag,
  addCustomTag,
  validatePetForm,
  buildUploadData,
  getSpeciesOptions,
  findSpeciesDisplay,
};
