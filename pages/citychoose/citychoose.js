let staticData = require('../../data/staticData.js')
let utils = require('../../utils/utils.js')

Page({

  //页面的初始数据
  data: {
    alternative: null,
    cities: [],
    showItems: [],
    inputText: '',
  },

  //生命周期函数--监听页面加载
  onLoad: function(options) {
    this.setSortedArea(staticData.cities || [])
  },

  //按照字母顺序生成需要的数据格式
  setSortedArea(areas) {
    let cities = {}

    wx.getStorage({
      key: 'localCity',
      success: res => {
        cities['当前城市'] = []
        cities['当前城市'].push({
          'letter': '当前城市',
          'name': res.data
        })
      },
      complete: res => {
        areas = areas.sort((a, b) => {
          if (a.letter > b.letter) return 1
          if (a.letter < b.letter) return -1
          return 0
        })

        for (let i = 0, len = areas.length; i < len; i++) {
          let item = areas[i]
          delete item.districts
          let letter = item.letter
          if (!cities[letter]) {
            cities[letter] = []
          }
          cities[letter].push(item)
        }

        this.setData({
          alternative: true,
          cities,
          showItems: cities
        });
      }
    })
  },

  inputFilter(e) {
    let filterItems = {}
    let cities = this.data.cities
    let value = e.detail.value.replace(/\s+/g, '');
    if (value.length) {
      for (let i in cities) {
        let items = cities[i]
        for (let j = 0, len = items.length; j < len; j++) {
          let item = items[j]
          if (item.name.indexOf(value) !== -1) {
            if (utils.isEmptyObject(filterItems[i])) {
              filterItems[i] = []
            }
            filterItems[i].push(item);
          }
        }
      }
      let alterFlag = true;
      if (utils.isEmptyObject(filterItems)) {
        alterFlag = false
      }
      this.setData({
        alternative: alterFlag,
        showItems: filterItems,
      })
    } else {
      this.setData({
        alternative: true,
        showItems: cities,
      })
    }
  },

  choose(e) {
    let item = e.currentTarget.dataset.item
    let name = item.name
    wx.reLaunch({
      url: '../../pages/index/index?changed=true&city=' + name,
    })
  },

  cancel() {
    this.setData({
      alternative: true,
      inputText: '',
      showItems: this.data.cities,
    })
  },
})