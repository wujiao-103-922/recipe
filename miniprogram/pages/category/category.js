// pages/category/category.js

import global from "../../utils/global"
import api from "../../utils/api"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addVal: "", //要添加的类名
    editVal: "", //要修改的类名
    types: [], //所有的类别
    _id: ""
  },
  // 获取分类列表
  async _getCate() {
    let res = await api._get(global.tables.typeTable)
    // console.log(res)
    this.setData({
      types: res.data
    })
  },
  // 添加数据到数据库
  async _addtypes() {
    let typeName = this.data.addVal; // 获取输入框的值
    let types = this.data.types //获取所有的类别
    // console.log(typeName);
    if (typeName == "") return;
    // 1.判断当前数据库中是否存在相同的分类，如果存在，直接返回
    // 找不到返回-1  如果有 返回下标
    let index = types.findIndex((item) => {
      return item.typeName == typeName
    })
    // console.log(index);
    if (index != -1) {
      wx.showToast({
        title: '当前分类已经存在',
        icon: "none"
      })
      return;
    }
    // 2.执行添加
    let res = await api._add(global.tables.typeTable, {
      typeName
    })
    // console.log(res);
    wx.showToast({
      title: '添加成功',
    })
    // 添加成功后清空输入框
    this.setData({
      addVal: ""
    })
    // 添加成功 重新获取列表
    this._getCate()
  },
  // 删除分类列表
  async _delType(e) {
    // 获取_id,index
    console.log(e);
    let {
      id,
      index
    } = e.currentTarget.dataset
    // 执行删除
    let res = await api._del(global.tables.typeTable, id)
    // console.log(res);

    // 删除成功的提示
    if (res.stats.removed == 1) {
      wx.showToast({
        title: '删除成功',
      })
    }
    // 页面删除，
    let types = this.data.types;
    // index是索引，删除自己这一条数据，对原数组进行修改
    types.splice(index, 1)
    // console.log(types);
    // 然后对循环的列表数据重新赋值
    this.setData({
      types
    })
  },
  // 加载修改信息 分类列表名称
  _editType(e) {
    // index 
    let {
      index
    } = e.currentTarget.dataset
    let types = this.data.types;
    // console.log(types[index].typeName);
    console.log(types[index]._id);
    this.setData({
      editVal: types[index].typeName, //要修改的默认值
      _id: types[index]._id //要修改的条件
    })
  },
  // 执行修改操作
  async doEdit() {
    // 获取id及要修改的类名
    let {
      _id,
      editVal
    } = this.data
    if (editVal == "") return
    // 1、判断当前数据库中是否存在相同的类名
    let types = this.data.types
    let index = types.findIndex((item) => {
      return item.typeName == editVal
    })
    if (index != -1) {
      wx.showToast({
        title: '当前分类已存在',
        icon: "none"
      })
      return;
    }
    // 2.执行修改
    let res = await api._editOne(global.tables.typeTable, _id, {
      typeName: editVal
    })
    // console.log(res);
    if (res.stats.updated == 1) {
      wx.showToast({
        title: '修改成功',
      })
      this.setData({
        editVal: "",
        _id: ""
      })
      this._getCate()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取所有菜单分类
    this._getCate()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})