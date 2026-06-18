const api = require('../../utils/api');
const constants = require('../../utils/constants');

Page({
  data: {
    petId: null,
    petName: '',
    loading: true,
    reminders: [],
    vaccineRecords: [],
    dewormRecords: [],
    otherRecords: [],
    isPro: false,
  },

  onLoad: function(options) {
    if (options && options.pet_id) {
      this.setData({ petId: options.pet_id });
      this.loadData();
    }
  },

  loadData: function() {
    const that = this;
    const petId = that.data.petId;
    if (!petId) return;

    Promise.all([
      api.get('/pets/' + petId),
      api.get('/health', { pet_id: petId }).catch(function() { return { list: [] }; }),
      api.get('/auth/limits').catch(function() { return null; }),
    ]).then(function(results) {
      const petRes = results[0];
      const healthRes = results[1];
      const limitsRes = results[2];

      if (petRes) {
        that.setData({ petName: petRes.name || '' });
        wx.setNavigationBarTitle({ title: petRes.name + '的健康档案' });
      }

      const healthList = healthRes.list || [];
      that.processHealthRecords(healthList);

      that.setData({
        isPro: !!(limitsRes && limitsRes.tier === 'pro'),
        loading: false,
      });
    }).catch(function(err) {
      console.error('加载健康档案失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      that.setData({ loading: false });
    });
  },

  processHealthRecords: function(healthList) {
    const reminders = [];
    const vaccineRecords = [];
    const dewormRecords = [];
    const otherRecords = [];
    const today = new Date();

    for (let i = 0; i < healthList.length; i++) {
      const rec = healthList[i];
      const recordDate = rec.record_date ? constants.formatDate(rec.record_date) : '';
      const nextDate = rec.next_date ? constants.formatDate(rec.next_date) : '';
      
      let name = '';
      let type = rec.type || 'other';

      if (type === 'vaccine') {
        name = (rec.vaccine_name || rec.vaccine_type || '未知') + '疫苗';
      } else if (type === 'deworm') {
        const dewormLabel = rec.deworm_type === 'internal' ? '体内' : (rec.deworm_type === 'external' ? '体外' : '');
        name = dewormLabel + '驱虫';
        if (rec.medicine_name) {
          name += '·' + rec.medicine_name;
        }
      } else {
        name = rec.name || rec.description || '其他记录';
      }

      const statusInfo = this.getStatusInfo(rec);

      const record = {
        id: rec.id,
        name: name,
        date: recordDate,
        nextDate: nextDate,
        status: statusInfo.status,
        statusType: statusInfo.statusType,
        type: type,
        daysLeft: statusInfo.daysLeft,
        notes: rec.notes,
        vetHospital: rec.vet_hospital,
        batchNo: rec.batch_no,
        dosage: rec.dosage,
      };

      if (statusInfo.isReminder) {
        reminders.push(record);
      }

      if (type === 'vaccine') {
        vaccineRecords.push(record);
      } else if (type === 'deworm') {
        dewormRecords.push(record);
      } else {
        otherRecords.push(record);
      }
    }

    reminders.sort(function(a, b) {
      if (a.statusType === 'red' && b.statusType !== 'red') return -1;
      if (a.statusType !== 'red' && b.statusType === 'red') return 1;
      if (a.statusType === 'orange' && b.statusType === 'green') return -1;
      if (a.statusType === 'green' && b.statusType === 'orange') return 1;
      return (a.daysLeft || 0) - (b.daysLeft || 0);
    });

    vaccineRecords.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    dewormRecords.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    otherRecords.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    this.setData({
      reminders: reminders,
      vaccineRecords: vaccineRecords,
      dewormRecords: dewormRecords,
      otherRecords: otherRecords,
    });
  },

  getStatusInfo: function(record) {
    const today = new Date();
    const nextDate = record.next_date ? new Date(record.next_date) : null;
    
    if (!nextDate) {
      return {
        status: '已完成',
        statusType: 'green',
        isReminder: false,
        daysLeft: null,
      };
    }

    const daysDiff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    let status = '正常';
    let statusType = 'green';
    let isReminder = false;

    if (daysDiff < 0) {
      status = '已过期';
      statusType = 'red';
      isReminder = true;
    } else if (daysDiff <= 7) {
      status = '即将到期';
      statusType = 'orange';
      isReminder = true;
    }

    return {
      status: status,
      statusType: statusType,
      isReminder: isReminder,
      daysLeft: daysDiff,
    };
  },

  goRecordVaccine: function() {
    const that = this;
    that.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/health-add/health-add?pet_id=${that.data.petId}&type=vaccine` });
  },

  goRecordDeworm: function() {
    const that = this;
    that.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/health-add/health-add?pet_id=${that.data.petId}&type=deworm` });
  },

  goAddHealth: function() {
    const that = this;
    that.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/health-add/health-add?pet_id=${that.data.petId}` });
  },

  goEditRecord: function(e) {
    const id = e.currentTarget.dataset.id;
    const that = this;
    that.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/health-add/health-add?editId=${id}` });
  },

  onShow: function() {
    if (this.data.needRefresh) {
      this.loadData();
      this.setData({ needRefresh: false });
    }
  },
});