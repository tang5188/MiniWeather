App({

  globalData: {
    keepScreenOn: false,
    systemInfo: {},
    isIPhoneX: false,
    ak: '5dqzBg08nmOKEy43iey5qSF7ayytLrSU',
  },

  // 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
  onLaunch() {
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res;
        this.globalData.isIPhoneX = /iphonex/gi.test(res.model.replace(/\s+/, ''));
        console.log(res);
      },
    })
  },

  setGeoCoderUrl(address) {
    return `https://api.map.baidu.com/geocoder/v2/?address=${address}&output=json&ak=${this.globalData.ak}`;
  },

  // 当小程序启动，或从后台进入前台显示，会触发 onShow
  onShow: function(options) {

  },

  // 当小程序从前台进入后台，会触发 onHide
  onHide: function() {

  },

  // 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
  onError: function(msg) {

  }
})