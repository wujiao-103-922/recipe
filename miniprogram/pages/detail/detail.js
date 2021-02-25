// pages/detail/detail.js

import global from "../../utils/global"
import api from "../../utils/api"
const _ = api.db.command

Page({
  /**
   * 页面的初始数据
   */
  data: {
     recipe:{},
     isfollows:false
  },
  onLoad(option){
    // console.log(option);
    this.data.id = option.id
    this._getRecipes()
  },
  // 获取菜谱
  async _getRecipes(){
    // 菜谱id
    let id = this.data.id
    // 执行获取菜谱信息
    let res = await api._getById(global.tables.recipeTable,id)
    // console.log(res);

    // 处理动态的标题
    wx.setNavigationBarTitle({
      title: res.data.recipeName,
    })
    // 获取用户信息 openid
    let user = await api._get(global.tables.userTable,{_openid:res.data._openid})
    // console.log(user);
    
    // 临时存储获取的用户信息  res.data
    res.data.userInfo = user.data[0].userInfo
     // 获取分类名称 菜谱 recipeTypeId===分类  _id
     let typeres = await api._getById(global.tables.typeTable,res.data.recipeTypeId)
    // console.log(typeres);
    
     // 临时存储获取的分类信息  res.data
     res.data.typeName = typeres.data.typeName


    //  浏览次数 views
    // 1.视图更新
    res.data.views++;
    // 2.数据库更新  view修改
    let viewres = await api._editOne(global.tables.recipeTable,id,{
      views: _.inc(1)
    })
    // console.log(viewres);

    // 关注模块
    // 判断有没有登录，openid
    let _openid = wx.getStorageSync('_openid')
    // console.log(_openid);
    if(_openid==""){
        // 1.未登录，直接设置isfollows false
        this.setData({
          recipe:res.data,
          isfollows:false
        })
        return
    }
    // 2.已经登录
      // 2.1 判断当前用户有没有关注当前菜谱
      // 查询关注表  用户 && 菜谱 作为共同查询的条件
      let where = {
        _openid,
        recipeID:id
      }
      let followsres = await api._get(global.tables.followsTable,where)
      // console.log(followsres);
      // 没有关注 isfollows false
      if(followsres.data == null || followsres.data.length<=0){ 
         this.setData({
          recipe:res.data,
          isfollows:false
        })
        return
      } 
        // 已经关注 isfollows true
        this.setData({
          isfollows:true,
          recipe:res.data
        })
  },
  // 关注，取消关注
  async doFollow(){
    let id = this.data.id
    // 1.先去判断有没有登录，
    let _openid = wx.getStorageSync('_openid')
    // console.log(_openid);
    if(_openid==""){
        // 1.未登录，直接设置isfollows false
        this.setData({
          isfollows:false
        })
        wx.showToast({
          title: '请先去登录',
          icon:"none"
        })
        return
    }
    // 2.登录之后判断有没有关注
    if(this.data.isfollows){
        // 2）关注，执行取消关注的操作----数据库删除数据
        // console.log('取消关注');
        let where={
          _openid,
          recipeID:id
        }
        // 关注表删除
        let delres = await api._delByWhere(global.tables.followsTable,where)
        // console.log(delres);
        // c菜谱表更新
         // 菜谱表的follows -1
         let editres = await api._editOne(global.tables.recipeTable,id,{
          follows: _.inc(-1)
        })
        // 页面上flow-1
        this.data.recipe.follows--;
        this.setData({
          recipe:this.data.recipe,
          isfollows:false
        })   
        // 提示
        wx.showToast({
          title: '取消关注成功',
        })    
    }else{
        // 1）没有关注，执行关注操作----数据库添加数据 recipeID 关注的菜谱id
        // console.log('去关注');
        // 将菜谱id添加到关注表
        let res = await api._add(global.tables.followsTable,{recipeID:id})
        // console.log(res);      
        // 菜谱表的follows +1
        let editres = await api._editOne(global.tables.recipeTable,id,{
          follows: _.inc(1)
        })
        // 页面上flow+1
        this.data.recipe.follows++;
        this.setData({
          recipe:this.data.recipe,
          isfollows:true
        })
        // 提示
        wx.showToast({
          title: '关注成功',
        })      
    }   
  }
})