// pages/my/my.js
import global from "../../utils/global"
import api from "../../utils/api"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: 0,
    userInfo: {},
    isLogin: false, //是否登录。 false 未登录  true，已经登录
    recipes: [], //菜谱
    types: [], //菜单分类
    lists: [], //菜单列表
  },
  // 获取自己发布的菜谱
  async _getSelfRecipe() {

    // 查询条件
    let where = {
      _openid: wx.getStorageSync('_openid'),
      status: 1
    }
    // 执行查询
    let res = await api._get(global.tables.recipeTable, where)
    // console.log(res);
    if (res.data == null) return
    // 通过每个菜谱的openid,去用户表中去查询个人信息
    let userAll = []
    res.data.map((item) => {
      let result = api._get(global.tables.userTable, {
        _openid: item._openid
      })
      userAll.push(result)
    })
    userAll = await Promise.all(userAll)
    // console.log(userAll);
    // 给每一个菜谱数据  添加遮罩层控制属性
    res.data.map((item, index) => {
      item.opacity = 0
      item.userInfo = userAll[index].data[0].userInfo
    })
    this.setData({
      recipes: res.data
    })
  },
  // 选项卡
  changeIndex(e) {
    // console.log(e.currentTarget.dataset.index);
    let activeIndex = e.currentTarget.dataset.index
    this.setData({
      activeIndex
    })

  },
  // 跳转菜谱发布页面
  toRecipePage() {
    wx.navigateTo({
      url: '../pbrecipe/pbrecipe',
    })
  },
  // 处理遮罩层显示问题
  _delStyle(e) {
    // 获取索引
    let index = e.currentTarget.dataset.index;
    // 将所有的列表都设置不显示

    this.data.recipes.map((item) => {
      item.opacity = 0;
    })
    // 将长按的列表项设置为选中
    this.data.recipes[index].opacity = 1;
    this.setData({
      recipes: this.data.recipes
    })

  },
  // 执行删除操作
  _doDelete(e) {
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    // 如果没有显示删除图标，点击删除，直接返回
    if (!this.data.recipes[index].opacity) return;
    let _this = this;
    wx.showModal({
      title: "删除提示",
      content: "您确定删除么？",
      async success(res) {
        if (res.confirm) {
          //执行删除
          // 执行数据库的删除---修改菜谱状态 status 1--0
          let result = await api._editOne(global.tables.recipeTable, id, {
            status: 0
          });
          // console.log('执行删除')
          _this.data.recipes.splice(index, 1)
          _this.setData({
            recipes: _this.data.recipes
          })
          // console.log(result);
          wx.showToast({
            title: '删除成功',
          })
        } else {
          //取消删除
          _this.data.recipes[index].opacity = 0;
          _this.setData({
            recipes: _this.data.recipes
          })
        }
      }
    })
  },
  // 判断是否登录
  onShow() {
    this._getSelfTypes()
    this._getSelfRecipe()
    this._getSelfFollows()

    let _this = this;
    wx.checkSession({
      success(res) {
        let userInfo = wx.getStorageSync('userInfo')
        // 已经登录
        _this.setData({
          isLogin: true,
          userInfo
        })
      },
      fail() {
        // 没有登录
        _this.setData({
          isLogin: false
        })

        wx.showToast({
          title: '暂未登录',
          icon: "none"
        })
      }
    })
  },
  // 执行登录
  _login(e) {
    // 拒绝
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '登陆后更好哦',
        icon: "none"
      })
      return;
    }
    // console.log(e.detail.userInfo);
    let userInfo = e.detail.userInfo
    let _this = this
    // 登录
    wx.login({
      async success() {
        // 已经登录
        // 1.先判断当前用户是否已经登陆过，openid
        // 调用云函数返回openid
        wx.cloud.callFunction({
          name: "login"
        }).then(async (res) => {
          // console.log(res.result.openid);
          let _openid = res.result.openid

          // _openid 查询是否存在，不存在再执行添加 
          let result = await api._get(global.tables.userTable, {
            _openid
          })
          // console.log(result);
          if (result.data == null || result.data.length <= 0) {
            // // 执行添加   存储到数据库
            let address = await api._add(global.tables.userTable, {
              userInfo
            })
            // console.log(address);
            // 判断添加失败时
            if (!address._id) {
              _this.setData({
                isLogin: false
              })
            }
          }

          _this.setData({
            userInfo,
            isLogin: true
          })
          // 设置缓存
          wx.setStorageSync('userInfo', userInfo)

          // 设置openid 
          wx.setStorageSync('_openid', _openid)

        })
      }
    })


  },
  // 管理员进入菜谱分类管理页面
  _toCatePage() {
    // 判断当前用户的openid是否是管理员
    let _openid = wx.getStorageSync('_openid')

    if (_openid != global.adminOpenid) return;

    wx.navigateTo({
      url: '../category/category',
    })

  },
  // 获取自己发布的分类
  async _getSelfTypes() {
    // 1)获取自己发布的菜谱所对应的分类名称
    let _openid = wx.getStorageSync('_openid')

    let where = {
      status: 1,
      _openid
    }
    let recipes = await api._get(global.tables.recipeTable, where)
    if (recipes.data == null) return
    //typeid
    let types = recipes.data.map(item => {
      return item.recipeTypeId
    })
    // (2)数组去重 [...new Set(types)]
    // Array.from（）
    types = [...new Set(types)]
    // console.log(types);
    // （3）根据去重后的分类id,去分类表中查询对应的分类信息
    let typeAll = []
    types.map(item => {
      let type = api._getById(global.tables.typeTable, item)
      typeAll.push(type)
    })
    typeAll = await Promise.all(typeAll)
    // console.log(typeAll);
    this.setData({
      types: typeAll
    })
  },
  // 获取自己的关注
  async _getSelfFollows() {
    let _openid = wx.getStorageSync('_openid')
    // 先去关注表获取关注的菜谱id
    let selfFollows = await api._get(global.tables.followsTable, {
      _openid
    })
    // console.log(selfFollows);
    // 判断数据库首次存储 没有数据返回null时，直接返回
    if (selfFollows.data == null) return
    // 存储所有自己关注测菜谱的信息
    let lists = []
    selfFollows.data.map(item => {
      let list = api._getById(global.tables.recipeTable, item.recipeID)
      lists.push(list)
    })
    lists = await Promise.all(lists)
    // console.log(lists);
    // 通过菜谱所对应的发布菜谱的人 的openid 去用户表中查询
    let userPromises = []
    lists.map((item, index) => {
      let userPromise = api._get(global.tables.userTable, {
        _openid: item.data._openid
      })
      userPromises.push(userPromise)
    })
    userPromises = await Promise.all(userPromises)
    // console.log(userPromises);
    // 循环给每一个菜谱，添加对应的用户信息
    lists.map((item, index) => {
      item.data.userInfo = userPromises[index].data[0].userInfo
    })
    // console.log(lists);
    this.setData({
      lists
    })
  },
  // 跳转至列表页
  toListPage(e) {
    let {
      id = null,
        title,
        tag
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../list/list?typeID=${id}&title=${title}&tag=${tag}`,
    })
  },
  //   跳转至详情页
  toDetail(e) {
    let {
      id
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    })
  }
})