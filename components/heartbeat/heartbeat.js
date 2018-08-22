let utils = require('../../utils/utils.js')

Component({
  // 组件的初始数据
  data: {
    windowWidth: 0,
    windowHeight: 0,
    arr: [],
    duration: 5000,
    animations: [],
    lefts: [],
    tops: [],
    widths: [],
  },

  // 组件的属性列表
  properties: {
    show: {
      type: Boolean,
      value: true,
    },
  },

  ready() {
    let systemInfo = getApp().globalData.systemInfo
    if (utils.isEmptyObject(systemInfo)) {
      wx.getSystemInfo({
        success: res => {
          this.setData({
            windowWidth: res.windowWidth || res.screenWidth,
            windowHeight: res.windowHeight || res.screenHeight,
          })
        },
      })
    } else {
      this.setData({
        windowWidth: systemInfo.windowWidth || systemInfo.screenWidth,
        windowHeight: systemInfo.windowHeight || systemInfo.screenHeight,
      })
    }
    let num = parseInt(Math.random() * 100) + 10
    let arr = Array.apply(null, {
      length: num
    }).map(function(value, index) {
      return index + 1
    })
    this.setData({
      arr,
    })
  },

  // 组件的方法列表
  methods: {
    dance(callback) {
      let windowWidth = this.data.windowWidth
      let windowHeight = this.data.windowHeight
      let duration = this.data.duration
      let animations = []
      let lefts = []
      let tops = []
      let widths = []
      for (let i = 0; i < this.data.arr.length; i++) {
        lefts.push(Math.random() * windowWidth)
        tops.push(-140)
        widths.push(Math.random() * 50 + 40)
        let animation = wx.createAnimation({
          duration: Math.random() * (duration - 1000) + 1000
        })
        animation.top(windowHeight).left(Math.random() * windowWidth).rotate(Math.random() * 960).step()
        animations.push(animation.export())
      }
      this.setData({
        lefts,
        tops,
        widths
      })
      let timer = setTimeout(() => {
        this.setData({
          animations,
        })
        clearTimeout(timer)
      }, 200)
      let end = setTimeout(() => {
        callback && callback()
        clearTimeout()
      }, duration)
    }
  }
})