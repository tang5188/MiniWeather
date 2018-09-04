Page({

  //页面的初始数据
  data: {
    url: 'https://github.com/tang5188/MiniWeather'
  },

  copy(e) {
    console.log(e);
    let dataset = (e.currentTarget || {}).dataset || {}
    let url = dataset.url || ''
    if (url !== '') {
      wx.setClipboardData({
        data: url,
        success: res => {
          wx.showToast({
            title: '已复制',
            duration: 2000
          })
        }
      })
    }
  }
})