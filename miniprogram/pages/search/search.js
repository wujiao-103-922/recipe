// pages/search/search.js
import global from "../../utils/global"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recipe: [],
    search: [],
    sea:""
  },
  onShow() {
    // 请求热门搜索
    this._getHotRecipe()
    this._getSearch()
  },
  async _getHotRecipe() {
    let where = {
      status: 1
    }
    let orderBy = {
      field: "views",
      sort: "desc"
    }
    // 执行查询
    let res = await api._getByPage(global.tables.recipeTable, where, orderBy, 6, 1)
    // console.log(res);
    this.setData({
      recipe: res.data
    })
  },
  // 跳转至详情页
  toDetail(e) {
    // 菜谱id
    let {
      id,
      title
    } = e.currentTarget.dataset
    // 近期搜索
    // 获取近期搜索关键字，判断缓存中有没有typeName
    let searchs = wx.getStorageSync('searchs')||[]
    // 判断缓存中有没有title
    // findIndex  传入判断条件  为假  找不到 -1
    let index = searchs.findIndex(item => {
      return item == title
    })
    // 没有存储过，数组里添加新的搜索关键字
    if (index == -1) {
      searchs.unshift(title)
    }else{
   // 存储过
    // 改变先后顺序，先删除，再添加
    searchs.splice(index,1)
    searchs.unshift(title)
    }
    wx.setStorageSync('searchs', searchs)
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    })
  },
  _getSearch(){
    // 获取搜索词
    let search=wx.getStorageSync('searchs')
    // console.log(search);
    this.setData({
      search
    })
  },
  // 跳转至列表页
  toListPage(e){
    let {
        id=null,
        title,
        tag
      } = e.currentTarget.dataset
      wx.navigateTo({
        url: `../list/list?typeID=${id}&title=${title}&tag=${tag}`,
      })
},
})