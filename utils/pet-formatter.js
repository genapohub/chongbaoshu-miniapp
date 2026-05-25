/**
 * 宠物数据格式化工具
 * 从 pet-detail.js 提取的共享数据格式化逻辑
 */
const constants = require('./constants');

/** 繁育状态→颜色映射 */
const BREEDING_STATUS_COLORS = {
  mated: 'gray',
  pregnant: 'orange',
  ultrasound_confirmed: 'orange',
  delivered: 'green',
  weaned: 'green',
  failed: 'red',
};

/** 健康状态→颜色映射 */
const HEALTH_STATUS_COLORS = {
  '已完成': 'green',
  '正常': 'green',
  '即将到期': 'orange',
  '已过期': 'red',
};

/**
 * 拼接繁育名称
 * @param {string} motherName - 母方名称
 * @param {string} fatherName - 父方名称
 * @returns {string} 展示名称
 */
function buildBreedingName(motherName, fatherName) {
  if (motherName && fatherName) return motherName + ' × ' + fatherName;
  return motherName || fatherName || '';
}

/**
 * 获取繁育状态标签
 * @param {string} status - 状态码
 * @returns {string} 中文标签
 */
function getBreedingStatusLabel(status) {
  const info = constants.BREEDING_STATUS[status];
  return info ? info.label : status;
}

/**
 * 获取繁育状态颜色类型
 * @param {string} status - 状态码
 * @returns {string} 颜色类型 (gray/orange/green/red)
 */
function getBreedingStatusType(status) {
  return BREEDING_STATUS_COLORS[status] || 'gray';
}

/**
 * 获取宠物状态标签
 * @param {string} status - 状态码
 * @returns {string} 中文标签
 */
function getPetStatusLabel(status) {
  const info = constants.PET_STATUS[status];
  return info ? info.label : status;
}

/**
 * 获取健康状态文本
 * @param {Object} record - 健康记录
 * @returns {string} 状态文本
 */
function getHealthStatus(record) {
  const today = new Date();
  const nextDate = record.next_date ? new Date(record.next_date) : null;
  if (!nextDate) return '已完成';
  const daysDiff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  if (daysDiff < 0) return '已过期';
  if (daysDiff <= 7) return '即将到期';
  return '正常';
}

/**
 * 获取健康状态颜色类型
 * @param {Object} record - 健康记录
 * @returns {string} 颜色类型
 */
function getHealthStatusType(record) {
  const status = getHealthStatus(record);
  return HEALTH_STATUS_COLORS[status] || 'gray';
}

/**
 * 格式化繁育记录列表
 * @param {Array} breedingList - 原始繁育记录
 * @returns {Array} 格式化后的记录
 */
function formatBreedingRecords(breedingList) {
  const records = [];
  for (let i = 0; i < breedingList.length; i++) {
    const rec = breedingList[i];
    const motherName = rec.mother_name || '';
    const fatherName = rec.father_name || rec.mate_name || '';
    records.push({
      id: rec.id,
      name: buildBreedingName(motherName, fatherName),
      date: constants.formatDate(rec.mating_date),
      status: getBreedingStatusLabel(rec.status),
      statusType: getBreedingStatusType(rec.status),
    });
  }
  return records;
}

/**
 * 格式化健康记录列表
 * @param {Array} healthList - 原始健康记录
 * @returns {Array} 格式化后的记录
 */
function formatHealthRecords(healthList) {
  const records = [];
  for (let i = 0; i < healthList.length; i++) {
    const rec = healthList[i];
    let name = rec.name || '';
    if (rec.type === 'vaccine') {
      name = (rec.vaccine_name || rec.vaccine_type || '未知') + '疫苗';
    } else if (rec.type === 'deworm') {
      const dewormInfo = constants.DEWORM_TYPE[rec.deworm_type];
      name = (dewormInfo || '') + '驱虫';
    } else if (!name && rec.description) {
      name = rec.description;
    }
    records.push({
      id: rec.id,
      name: name,
      date: constants.formatDate(rec.record_date),
      nextDate: constants.formatDate(rec.next_date),
      status: getHealthStatus(rec),
      statusType: getHealthStatusType(rec),
    });
  }
  return records;
}

module.exports = {
  buildBreedingName,
  getBreedingStatusLabel,
  getBreedingStatusType,
  getPetStatusLabel,
  getHealthStatus,
  getHealthStatusType,
  formatBreedingRecords,
  formatHealthRecords,
};
