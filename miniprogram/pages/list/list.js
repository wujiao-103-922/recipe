// pages/list/list.js
import global from "../../utils/global"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: [],
    limit: 4,
    page: 1,
    tip: false,
  },
  onLoad(option) {
    // console.log(option);
    let {
      title
    } = option
    this.data.title=option.title
    this.data.typeID = option.typeID
    this.data.tag = option.tag
    wx.setNavigationBarTitle({
      title
    })
    // 获取菜谱数据
    this._getRecipe()
  },
  async _getRecipe() {
    let where = {}
    let orderBy = {}
    // 做判断从哪个页面进入列表页
    switch (this.data.tag) {
      case "ptfl":
        where = {
          status: 1,
          recipeTypeId: this.data.typeID
        }
        orderBy = {
          field: "time",
          sort: "desc"
        }
        break;
      case "gzcp":
        where = {
          status: 1
        }
        orderBy = {
          field: "follows",
          sort: "desc"
        }
        break;
      case "rmcp":
        where = {
          status: 1
        }
        orderBy = {
          field: "views",
          sort: "desc"
        }
        break;
        case "cpss":
          where={
            status:1,
            // 模糊搜索
            recipeName:api.db.RegExp({
              regexp:this.data.title,
              option:"i"
            })
          }
          orderBy={
            field: "time",
            sort: "desc"
          }
          break;
    }
    let res = await api._getByPage(global.tables.recipeTable, where, orderBy, this.data.limit, this.data.page)
    // console.log(res);
    // 判断当前获取的个数和limit做对比
    if (res.data.length <= this.data.limit && res.data.length > 0) {
      this.setData({
        tip: true
      })
    }
    // 通过每个菜谱的openid,去用户表中去查询个人信息
    let userAll = []
    res.data.map((item, index) => {
      let result = api._get(global.tables.userTable, {
        _openid: item._openid
      })
      userAll.push(result)
    })
    userAll = await Promise.all(userAll)
    // console.log(userAll);
    // 给每一个菜谱数据添加用户信息
    res.data.map((item, index) => {
      item.userInfo = userAll[index].data[0].userInfo
    })
    // 数据拼接
    res.data = this.data.lists.concat(res.data)
    this.setData({
      lists: res.data
    })
  },
      //   跳转至详情页
      toDetail(e){
        let {id} = e.currentTarget.dataset
        wx.navigateTo({
          url: '../detail/detail?id='+id,
        })
    },
  // 上拉触底
  onReachBottom() {
    this.data.page++
    // console.log(this.data.page);
    this._getRecipe()
  }
})