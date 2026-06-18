/**
 * 用户协议 & 隐私政策页面
 * 通过页面参数 type 区分：user-privacy | privacy-policy
 */
const AGREEMENTS = {
  'user-agreement': {
    title: '宠宝树用户服务协议',
    updateTime: '2026年6月17日',
    content: `
<h2>一、总则</h2>
<p>1.1 欢迎您使用「宠宝树」小程序（以下简称"本产品"）。本产品是宠宝树开发团队（以下简称"我们"）运营的宠物管理与繁育辅助工具。</p>
<p>1.2 在使用本产品前，请您仔细阅读并充分理解本协议全部内容。如您不同意本协议任何内容，请立即停止使用。</p>

<h2>二、账号与注册</h2>
<p>2.1 您需要通过微信授权或手机号验证后才能使用完整功能。</p>
<p>2.2 您对账户安全负有责任，建议定期修改密码并妥善保管。</p>
<p>2.3 您不得将账号转让、出借或赠予他人使用。</p>

<h2>三、服务内容</h2>
<p>3.1 本产品提供宠物档案管理、健康记录追踪、繁育计划管理、血统证书生成等服务。</p>
<p>3.2 部分高级功能（如无限宠物数量、高级数据导出等）需订阅付费版本。</p>
<p>3.3 我们保留随时调整服务内容和价格的权利，变更将通过应用内通知告知。</p>

<h2>四、用户行为规范</h2>
<p>4.1 您承诺不会利用本产品从事违法违规活动，包括但不限于发布虚假信息、侵权内容等。</p>
<p>4.2 您对自己发布的内容承担全部责任。</p>
<p>4.3 我们有权对违规内容进行删除、屏蔽或限制账号功能。</p>

<h2>五、知识产权</h2>
<p>5.1 本产品的所有内容包括但不限于文字、图片、界面设计等的知识产权归我们所有。</p>
<p>5.2 您上传的内容，您保留原始权利，但授予我们在产品运营范围内使用的许可。</p>

<h2>六、免责声明</h2>
<p>6.1 本产品提供的健康管理建议仅供参考，不构成专业兽医诊疗意见。</p>
<p>6.2 因不可抗力导致的服务中断，我们将尽力恢复但不承担责任。</p>

<h2>七、协议变更</h2>
<p>7.1 我们可能适时修订本协议，新版协议公布后继续使用即表示同意新协议。</p>

<h2>八、联系我们</h2>
<p>8.1 如有疑问，请在小程序内通过"意见反馈"联系我们。</p>
<p>8.2 或发送邮件至：support@chongbaoshu.com</p>
`
  },
  'privacy-policy': {
    title: '宠宝树隐私政策',
    updateTime: '2026年6月17日',
    content: `
<h2>引言</h2>
<p>「宠宝树」（以下称"我们"）深知个人信息的重要性，我们将按照本隐私政策保护您的个人信息。</p>

<h2>一、我们收集的信息</h2>
<p><b>1.1 账号信息：</b>微信OpenID/UnionID、手机号码（如你选择绑定）。</p>
<p><b>1.2 宠物信息：</b>宠物名称、品种、性别、生日、照片、芯片号、健康记录、繁育记录等您主动填写的信息。</p>
<p><b>1.3 设备信息：</b>设备型号、操作系统版本、唯一设备标识符（用于保障服务安全）。</p>
<p><b>1.4 日志信息：</b>使用记录、操作日志、错误日志（用于改进服务质量）。</p>

<h2>二、信息的使用目的</h2>
<p>2.1 提供、维护、保护和改进我们的服务。</p>
<p>2.2 处理您的订单和订阅请求。</p>
<p>2.3 发送服务通知（如疫苗提醒、到期提醒），仅在您授权后进行。</p>
<p>2.3 分析产品使用情况以优化用户体验。</p>

<h2>三、信息的共享</h2>
<p>除以下情形外，我们未经您同意不会与第三方共享您的个人信息：</p>
<p>3.1 获得您的明确同意；</p>
<p>3.2 根据法律法规要求向监管部门提供；</p>
<p>3.3 与可信的第三方服务商合作（如云存储、支付处理），且他们受严格保密协议约束。</p>

<h2>四、信息的存储与保护</h2>
<p>4.1 您的信息存储在中华人民共和国境内服务器上。</p>
<p>4.2 我们采用行业标准的技术和管理措施保护信息安全，包括数据加密传输、访问控制等。</p>
<p>4.3 数据保存期限：在账号存续期间及法律要求的最低期限内保存。</p>

<h2>五、您的权利</h2>
<p>5.1 您有权访问、更正、导出您的个人数据。</p>
<p>5.2 您有权申请注销账号，我们将在15个工作日内完成处理。</p>
<p>5.3 如对我们的隐私保护有疑问，可通过意见反馈联系我们。</p>

<h2>六、未成年人保护</h2>
<p>6.1 我们的产品主要面向成年用户。若您是未满18周岁的未成年人，请在监护人陪同下阅读并在征得监护人同意后使用。</p>

<h2>七、政策更新</h2>
<p>7.1 本政策可能适时更新，重大变更将通过弹窗等形式通知您。</p>

<h2>八、联系我们</h2>
<p>8.1 对隐私保护有疑问，请在小程序内通过"意见反馈"联系我们。\n<p>8.2 开发者邮箱：chongbaoshu@outlook.com</p>`
  }
};

Page({
  data: {
    title: '',
    updateTime: '',
    content: '',
    showConfirm: false,
    agreed: false,
    type: ''
  },

  onLoad(options) {
    const type = options.type || 'user-agreement';
    const agreement = AGREEMENTS[type] || AGREEMENTS['user-agreement'];
    const showConfirm = options.confirm === '1';

    this.setData({
      type,
      title: agreement.title,
      updateTime: agreement.updateTime,
      content: agreement.content,
      showConfirm
    });

    wx.setNavigationBarTitle({ title: agreement.title });
  },

  onCheckChange(e) {
    this.setData({ agreed: e.detail.value.length > 0 || e.detail.checked });
  },

  onConfirm() {
    if (!this.data.agreed) return;
    // 返回上一页并携带确认状态
    const pages = getCurrentPages();
    if (pages.length >= 2) {
      const prevPage = pages[pages.length - 2];
      if (prevPage && typeof prevPage.onAgreementConfirmed === 'function') {
        prevPage.onAgreementConfirmed(this.data.type);
      }
    }
    wx.navigateBack();
  }
});
