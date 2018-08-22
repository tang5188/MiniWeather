let message = require('../../data/messages.js')
let bmap = require('../../libs/bmap-wx.js')
let utils = require('../../utils/utils.js')
let globalData = getApp().globalData
let SYSTEMINFO = globalData.systemInfo

Page({

  // 页面的初始数据
  data: {
    isIPhoneX: globalData.isIPhoneX,
    message: '',
    cityDatas: {},
    icons: ['/img/clothing.png', '/img/carwashing.png', '/img/pill.png', '/img/running.png', '/img/sun.png'],
    searchText: '',
    hasPopped: false,
    animationMain: {},
    animationOne: {},
    animationTwo: {},
    animationThree: {},
    cityChanged: false,
    searchCity: '',
    setting: {},
    bcgImg: '',
    bcgColor: '#40a7e7',
    showHeartbeat: true,
    enableSearch: true,
    pos: {},
    openSettingButtonShow: false,
  },

  //生命周期函数--监听页面显示
  onShow: function() {
    //天气数据
    this.getCityDatas()
    //菜单位置
    this.setMenuPosition()

    //根据时间，显示不同的背景色
    let bcgColor = utils.themeSetting()
    this.setData({
      bcgColor,
    })
    //设置背景图片
    this.setBcg()

    //设定初始化
    this.initSetting((setting) => {
      //检查是否需要有更新
      this.checkUpdate(setting)
    })

    //查询天气数据
    if (!this.data.cityChanged) {
      this.init({})
    } else {
      this.search(this.data.searchCity)
      this.setData({
        cityChanged: false,
        searchCity: '',
      })
    }
    this.setData({
      message: message.messages(),
    })
  },

  //生命周期函数--监听页面隐藏
  onHide: function() {
    //保存菜单按钮在画面上的位置
    wx.setStorage({
      key: 'pos',
      data: this.data.pos,
    })
  },

  //页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function() {
    this.init({});
  },

  //用户点击右上角分享
  onShareAppMessage: function() {
    return {
      title: "小天气",
      path: '/pages/index/index',
      success: res => {
        console.log("------小程序分享成功：")
        console.log(res)
      },
      fail: res => {
        console.log("------小程序分享失败：")
        console.log(res)
        let errMsg = res.errMsg || ''
        let msg = '分享失败，可重新分享'
        if (errMsg.indexOf('cancel') != -1) {
          msg = '取消分享'
        }
        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }
    }
  },

  //从storage中获取前一次天气数据
  getCityDatas() {
    let cityDatas = wx.getStorage({
      key: 'cityDatas',
      success: res => {
        console.log("------获取天气数据：")
        console.log(res)
        this.setData({
          cityDatas: res.data
        })
      },
    })
  },

  //从storage中获取前一次的菜单位置数据
  setMenuPosition() {
    wx.getStorage({
      key: 'pos',
      success: res => {
        console.log("------获取菜单位置数据：")
        console.log(res)
        this.setData({
          pos: res.data,
        })
      },
      fail: res => {
        this.setData({
          pos: {}
        })
      },
    })
  },

  //设置小程序的背景照片
  setBcg() {
    wx.getSavedFileList({
      success: (res) => {
        console.log("------本地保存的文件列表：")
        console.log(res);

        let fileList = res.fileList
        if (!utils.isEmptyObject(fileList)) {
          this.setData({
            bcgImg: fileList[0].filePath
          })
        } else {
          this.setData({
            bcgImg: ''
          })
        }
      },
    })
  },

  //设定初始化
  initSetting(successFunc) {
    wx.getStorage({
      key: 'setting',
      success: res => {
        let setting = res.data || {}
        this.setData({
          setting,
        })
        successFunc && successFunc(setting)
      },
      fail: () => {
        this.setData({
          setting: {}
        })
      },
    })
  },

  //检查更新
  checkUpdate(setting) {
    if (!setting.forceUpdate || !wx.getUpdateManager) {
      return
    }
    let updateManager = wx.getUpdateManager()
    //检查是否有更新
    updateManager.onCheckForUpdate((res) => {
      console.log(res)
    })
    //更新包已准备好
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已下载完成，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
  },

  //重新获取天气信息
  init(params) {
    let BMap = new bmap.BMapWX({
      ak: globalData.ak,
    })
    BMap.weather({
      location: params.location,
      fail: this.fail,
      success: this.success,
    })
  },

  //天气信息获取成功
  success(data) {
    this.setData({
      openSettingButtonShow: false,
    })
    console.log("------百度返回的天气数据：")
    console.log(JSON.stringify(data))
    //停止下拉
    wx.stopPullDownRefresh()
    //更新时间
    let now = new Date()
    data.updateTime = now.getTime()
    data.updateTimeFormat = utils.formatDate(now, "MM-dd hh:mm")

    let results = data.originalData.results[0] || {}
    data.pm = this.calcPM(results['pm25'])
    data.temperature = `${results.weather_data[0].date.match(/\d+/g)[2]}`
    wx.setStorage({
      key: 'cityDatas',
      data: data,
    })
    console.log("------处理过的天气数据：")
    console.log(data)
    this.setData({
      cityDatas: data
    })
  },

  //PM2.5数据分析
  calcPM(value) {
    if (value > 0 && value <= 50) {
      return {
        val: value,
        desc: '优',
        detail: '',
      }
    } else if (value > 50 && value <= 100) {
      return {
        val: value,
        desc: '良',
        detail: ''
      }
    } else if (value > 100 && value <= 150) {
      return {
        val: value,
        desc: '轻度污染',
        detail: '对敏感人群不健康'
      }
    } else if (value > 150 && value <= 200) {
      return {
        val: value,
        desc: '中度污染',
        detail: '不健康'
      }
    } else if (value > 200 && value <= 300) {
      return {
        val: value,
        desc: '重度污染',
        detail: '非常不健康'
      }
    } else if (value > 300 && value <= 500) {
      return {
        val: value,
        desc: '严重污染',
        detail: '有毒物'
      }
    } else if (value > 500) {
      return {
        val: value,
        desc: '爆表',
        detail: '污染爆表'
      }
    }
  },

  //天气信息获取失败
  fail(res) {
    wx.stopPullDownRefresh()
    let errMsg = res.errMsg || ''
    if (errMsg.indexOf('deny') !== -1 || errMsg.indexOf('denied') !== -1) {
      wx.showToast({
        title: '需要开启地理位置权限',
        icon: 'none',
        duration: 2500,
        success: (res) => {
          if (this.canUseOpenSettingApi()) {
            let timer = setTimeout(() => {
              clearTimeout(timer);
              wx.openSetting({})
            }, 2500)
          } else {
            this.setData({
              openSettingButtonShow: true,
            })
          }
        },
      })
    } else {
      wx.showToast({
        title: '网络不给力，请稍后再试',
        icon: 'none'
      })
    }
  },

  //查询天气
  search(val) {
    //520/521时的特效处理
    if (val === '520' || val === '521') {
      this.setData({
        searchText: ''
      })
      this.dance()
      return
    }
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
    })
    if (val) {
      this.geocoder(val, (loc) => {
        this.init({
          location: `${loc.lng},${loc.lat}`
        })
      })
    }
  },

  //解析地址地理坐标
  geocoder(address, success) {
    wx.request({
      url: getApp().setGeoCoderUrl(address),
      success(res) {
        console.log("------地理坐标解析：")
        console.log(res)

        let data = res.data || {}
        if (!data.status) {
          let location = (data.result || {}).location || {}
          success && success(location)
        } else {
          wx.showToast({
            title: data.msg || '网络不给力，请稍后再试',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: res.errMsg || '网络不给力，请稍后再试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({
          searchText: '',
        })
      },
    })
  },

  //事件 - 查询城市
  commitSearch(res) {
    let val = ((res.detail || {}).value || '').replace(/\s+/g, '')
    this.search(val);
  },

  //特效
  dance() {
    this.setData({
      enableSearch: false
    })
    let heartbeat = this.selectComponent('#heartbeat');
    heartbeat.dance(() => {
      this.setData({
        showHeartbeat: false,
        enableSearch: true
      })
      this.setData({
        showHeartbeat: true,
      })
    })
  },

  //检查是否可以设置
  canUseOpenSettingApi() {
    let systeminfo = getApp().globalData.systemInfo
    let SDKVersion = systeminfo.SDKVersion
    let version = utils.cmpVersion(SDKVersion, '2.0.7')
    if (version < 0) {
      return true
    } else {
      return false
    }
  },

  //事件 - 拖动菜单移动位置
  menuMainMove(e) {
    if (this.data.hasPopped) {
      this.takeback()
      this.setData({
        hasPopped: false,
      })
    }
    let windowWidth = SYSTEMINFO.windowWidth
    let windowHeight = SYSTEMINFO.windowHeight
    
    let touches = e.touches[0]
    let clientX = touches.clientX
    let clientY = touches.clientY

    if (clientX > windowWidth - 40) clientX = windowWidth - 40
    if (clientX <= 90) clientX = 90
    if (clientY > windowHeight - 40 - 60) clientY = windowHeight - 40 - 60
    if (clientY <= 60) clientY = 60

    let pos = {
      left: clientX,
      top: clientY
    }
    this.setData({
      pos,
    })
  },

  //事件 - 点击菜单
  menuMain() {
    if (!this.data.hasPopped) {
      this.popp()
      this.setData({
        hasPopped: true,
      })
    } else {
      this.takeback()
      this.setData({
        hasPopped: false
      })
    }
  },

  //事件 - 选择城市
  menuOne() {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/citychoose/citychoose',
    })
  },

  //事件 - 设置
  menuTwo() {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/setting/setting',
    })
  },

  //设置 - 关于
  menuThree() {
    this.menuMain()
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },

  //菜单展开
  popp() {
    let animationMain = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationOne = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationTwo = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationThree = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    animationMain.rotateZ(180).step()
    animationOne.translate(-50, -60).rotateZ(360).opacity(1).step()
    animationTwo.translate(-90, 0).rotateZ(360).opacity(1).step()
    animationThree.translate(-50, 60).rotateZ(360).opacity(1).step()
    this.setData({
      animationMain: animationMain.export(),
      animationOne: animationOne.export(),
      animationTwo: animationTwo.export(),
      animationThree: animationThree.export(),
    })
  },

  //菜单隐藏
  takeback() {
    let animationMain = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationOne = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationTwo = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    let animationThree = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out'
    })
    animationMain.rotateZ(0).step();
    animationOne.translate(0, 0).rotateZ(0).opacity(0).step()
    animationTwo.translate(0, 0).rotateZ(0).opacity(0).step()
    animationThree.translate(0, 0).rotateZ(0).opacity(0).step()
    this.setData({
      animationMain: animationMain.export(),
      animationOne: animationOne.export(),
      animationTwo: animationTwo.export(),
      animationThree: animationThree.export(),
    })
  }
})