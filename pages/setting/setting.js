let utils = require('../../utils/utils.js')
Page({
  data: {
    setting: {},
    show: false,
    screenBrightness: '获取中',
    keepScreenON: false,
    SDKVersion: '',
    enableUpdate: true,
  },

  //设定开关切换
  switchChange(e) {
    let dataset = e.currentTarget.dataset
    let switchparam = dataset.switchparam
    let setting = this.data.setting
    if (switchparam == 'forceUpdate') {
      if (this.data.enableUpdate) {
        setting[switchparam] = (e.detail || {}).value
      } else {
        setting[switchparam] = false
        wx.showToast({
          title: '基础库版本较低，无法使用该功能',
          icon: 'none',
          duration: 2000,
        })
      }
    } else if (switchparam == 'keepScreenON') {
      var val = !this.data.keepScreenON
      this.data.keepScreenON = val;
      setting[switchparam] = val;
      getApp().globalData.keepscreenon = val;
    } else {
      setting[switchparam] = !(e.detail || {}).value
    }
    this.setData({
      setting,
    })
    wx.setStorage({
      key: 'setting',
      data: setting,
    })
  },

  //默认背景
  defaultBcg() {
    this.removeBcg(() => {
      wx.showToast({
        title: '恢复默认背景',
        duration: 1500,
      })
    })
  },

  //移除保存的文件
  removeBcg(callback) {
    wx.getSavedFileList({
      success: res => {
        let fileList = res.fileList
        let len = fileList.length
        if (len > 0) {
          for (let i = 0; i < len; i++)(
            function(path) {
              wx.removeSavedFile({
                filePath: path,
                complete: function(r) {
                  if (i === len - 1) {
                    callback && callback()
                  }
                }
              })
            })(fileList[i].filePath)
        } else {
          callback && callback()
        }
      },
      fail: res => {
        wx.showToast({
          title: '出错了，请稍后再试',
          icon: 'none'
        })
      }
    })
  },

  //自定义背景
  customBcg() {
    wx.chooseImage({
      success: (res) => {
        this.removeBcg(() => {
          wx.saveFile({
            tempFilePath: res.tempFilePaths[0],
            success: r => {
              wx.navigateBack({})
            },
          })
        })
      },
      fail: res => {
        let errMsg = res.errMsg
        if (errMsg.indexOf('cancel') === -1) {
          wx.showToast({
            title: '发生错误，请稍后再试',
            icon: 'none'
          })
        }
      },
    })
  },

  hide() {
    this.setData({
      show: false
    })
  },

  updateInstruc() {
    this.setData({
      show: true
    })
  },

  onShow() {
    this.setData({
      keepScreenON: getApp().globalData.keepScreenOn
    })
    this.ifDisableUpdate()
    this.getScreenBrightness()
    wx.getStorage({
      key: 'setting',
      success: res => {
        let setting = res.data
        this.setData({
          setting
        })
      },
      fail: res => {
        this.setData({
          setting: {}
        })
      }
    })
  },

  ifDisableUpdate() {
    let systemInfo = getApp().globalData.systemInfo
    let SDKVersion = systemInfo.SDKVersion
    let version = utils.cmpVersion(SDKVersion, '1.9.90')
    if (version > 0) {
      this.setData({
        SDKVersion,
        enableUpdate: true,
      })
    } else {
      this.setData({
        SDKVersion,
        enableUpdate: false
      })
    }
  },

  getHCEState() {
    wx.showLoading({
      title: '检测中...',
    })
    wx.getHCEState({
      success: res => {
        wx.hideLoading()
        wx.showModal({
          title: '检测结果',
          content: '该设备支持NFC功能',
          showCancel: false,
          confirmText: 'OK',
          confirmColor: '#40a7e7'
        })
      },
      fail: res => {
        wx.hideLoading()
        wx.showModal({
          title: '检测结果',
          content: '该设备不支持NFC功能',
          showCancel: false,
          confirmText: 'OK',
          confirmColor: '#40a7e7',
        })
      }
    })
  },

  getScreenBrightness() {
    wx.getScreenBrightness({
      success: res => {
        this.setData({
          screenBrightness: Number(res.value * 100).toFixed(0),
        })
      },
      fail: res => {
        this.setData({
          screenBrightness: '获取失败'
        })
      }
    })
  },

  screenBrightnessChanging(e) {
    this.setScreenBrightness(e.detail.value)
  },

  setScreenBrightness(val) {
    wx.setScreenBrightness({
      value: val / 100,
      success: res => {
        this.setData({
          screenBrightness: val
        })
      }
    })
  },

  setKeepScreenOn(val) {
    wx.setKeepScreenOn({
      keepScreenOn: val,
      success: () => {
        this.setData({
          keepScreenON: val,
        })
      }
    })
  },

  getSystemInfo() {
    wx.navigateTo({
      url: '/pages/systeminfo/systeminfo',
    })
  },

  removeStorage(e) {
    let datatype = e.currentTarget.dataset.type
    if (datatype === 'menu') {
      wx.setStorage({
        key: 'menu_pos',
        data: {
          top: 'auto',
          left: 'auto'
        },
        success: res => {
          wx.showToast({
            title: '悬浮球已复位',
          })
        }
      })
    } else if (datatype === 'setting') {
      wx.showModal({
        title: '提示',
        content: '确认要初始化设置',
        cancelText: '取消',
        confirmColor: '#40a7e7',
        success: res => {
          if (res.confirm) {
            wx.removeStorage({
              key: 'setting',
              success: r => {
                wx.showToast({
                  title: '设置已初始化',
                })
                this.setData({
                  setting: {}
                })
              },
            })
          }
        }
      })
    } else if (datatype === 'all') {
      wx.showModal({
        title: '提示',
        content: '确认要删除',
        cancelText: '取消',
        confirmColor: '#40a7e7',
        success: res => {
          if (res.confirm) {
            wx.clearStorage({
              success: r => {
                wx.showToast({
                  title: '数据已清除',
                })
                this.setData({
                  setting: {},
                  pos: {}
                })
              }
            })
          }
        }
      })
    }
  }
})