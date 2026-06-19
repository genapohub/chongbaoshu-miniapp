const app = getApp();
const { get } = require('../../utils/api');

Page({
  data: {
    isPro: false,
    pedigreeData: null,
    selectedPet: null,
    canvasW: 600,
    canvasH: 400,
  },

  onLoad() {
    const userInfo = app.globalData.userInfo;
    this.setData({ isPro: userInfo && userInfo.subscription_tier === 'pro' });
    if (this.data.isPro) this.loadPets();
  },

  loadPets() {
    get('/pets?status=active').then(res => {
      if (res.code === 0 && res.data.list.length > 0) {
        const pet = res.data.list[0];
        this.setData({ selectedPet: pet });
        this.loadPedigree(pet.id);
      }
    });
  },

  loadPedigree(petId) {
    get(`/pets/${petId}/pedigree?generation=3`).then(res => {
      if (res.code === 0) {
        this.setData({ pedigreeData: res.data }, () => {
          this.drawTree();
        });
      }
    });
  },

  drawTree() {
    const query = wx.createSelectorQuery();
    query.select('#pedigreeCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0] || !res[0].node) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      const w = 600, h = 400;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      const data = this.data.pedigreeData;
      if (!data) return;

      // Draw background
      ctx.fillStyle = '#F6F4F0';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const topY = 60;

      // Draw current pet (center top)
      this.drawNode(ctx, cx, topY, data.name || '?', data.breed || data.species || '', '#4A8C5C');

      // Draw parents
      if (data.father_name || data.father) {
        const fx = cx - 150, fy = topY + 100;
        const fn = data.father_name || (data.father && data.father.name) || '?';
        const fb = data.father_breed || (data.father && data.father.breed) || '';
        this.drawLine(ctx, cx, topY + 25, fx, fy - 25);
        this.drawNode(ctx, fx, fy, fn, fb, '#2BA471');
      }

      if (data.mother_name || data.mother) {
        const mx = cx + 150, my = topY + 100;
        const mn = data.mother_name || (data.mother && data.mother.name) || '?';
        const mb = data.mother_breed || (data.mother && data.mother.breed) || '';
        this.drawLine(ctx, cx, topY + 25, mx, my - 25);
        this.drawNode(ctx, mx, my, mn, mb, '#E67E22');
      }

      // Draw grandparents
      const gfx = cx - 220, gfy = topY + 220;
      const gmx = cx + 220, gmy = topY + 220;
      if (data.grandfather_p_name) {
        this.drawLine(ctx, cx - 150, topY + 100 + 25, gfx - 60, gfy - 25);
        this.drawNode(ctx, gfx - 60, gfy, data.grandfather_p_name, '', '#C0C4CC');
      }
      if (data.grandmother_p_name) {
        this.drawLine(ctx, cx - 150, topY + 100 + 25, gfx + 60, gfy - 25);
        this.drawNode(ctx, gfx + 60, gfy, data.grandmother_p_name, '', '#C0C4CC');
      }
      if (data.grandfather_m_name) {
        this.drawLine(ctx, cx + 150, topY + 100 + 25, gmx - 60, gmy - 25);
        this.drawNode(ctx, gmx - 60, gmy, data.grandfather_m_name, '', '#C0C4CC');
      }
      if (data.grandmother_m_name) {
        this.drawLine(ctx, cx + 150, topY + 100 + 25, gmx + 60, gmy - 25);
        this.drawNode(ctx, gmx + 60, gmy, data.grandmother_m_name, '', '#C0C4CC');
      }
    });
  },

  drawNode(ctx, x, y, name, breed, color) {
    // Node box
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - 55, y - 20, 110, 50, 8);
    ctx.fill();

    // Name
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y);

    // Breed
    if (breed) {
      ctx.font = '10px sans-serif';
      ctx.fillText(breed, x, y + 16);
    }
  },

  drawLine(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = '#B0B0B0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  goUpgrade() {
    wx.navigateTo({ url: '/pages/subscribe/subscribe' });
  },
});
