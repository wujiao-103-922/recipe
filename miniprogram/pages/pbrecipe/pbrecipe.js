// pages/pbrecipe/pbrecipe.js

import global from "../../utils/global"
import api from "../../utils/api"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [], //获取所有的分类
    files: [] //所有上传的图片
  },
  // 选择图片
  _selecImage(e) {
    // console.log(e.detail.tempFilePaths);
    let tempFilePaths = e.detail.tempFilePaths //获取图片临时地址
    // 把数组变成对象[{src：xx.jpg}]
    let files = tempFilePaths.map((item) => {
      return {
        url: item
      }
    })
    // console.log(file);
    // 数组拼接  concat
    files = this.data.files.concat(files)
    this.setData({
      files
    })
  },
  // 获取分类列表
  async _getCate() {
    let res = await api._get(global.tables.typeTable)
    // console.log(res); 
    this.setData({
      types: res.data
    })
  },
  onLoad() {
    this._getCate()
  },
  // 提交表单，存入到数据库
  async _dosubmit(e){
    // console.log(e.detail.value);
    let {recipeName,recipeTypeId,recipeMakes} = e.detail.value;
    let time = new Date().getTime();
    let status = 1;
    let views = 0;
    let follows = 0;
    // console.log(this.data.files);

    // 存储到云端的所有文件id的数组 ["cl..","cl",.....]
    let filesID = await this._uploaderFiles(this.data.files)
    // console.log(filesID);
    // 判断是否为空
    if(recipeName == ""|| recipeMakes ==""|| filesID.length<=0){
      wx.showToast({
        title: '请补全信息',
        icon:"none"
      })
      return
    }

    // 执行添加
    let res = await api._add(global.tables.recipeTable,{
      recipeName,recipeTypeId,recipeMakes,time,status,views,follows,filesID
    })
    console.log(res);

    if(res._id){
      wx.showToast({
        title: '添加成功',
      })

      // 返回上一级
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1,
        })
      },1500)
    }
  },
  // 上传文件
 async _uploaderFiles(files) { 
  let filesID = []; //处理之后的所有图片在云端的存储地址 
  // 多文件上传处理 
  files.forEach((item,index)=>{
    let extName = item.url.split('.').pop()
    let cloudPath = "web/"+new Date().getTime()+index+"."+extName
    let promise = wx.cloud.uploadFile({
      cloudPath, // 上传至云端的路径
      filePath: item.url
    })
    filesID.push(promise)
  })

  // 等待所有结果都返回
  filesID = await Promise.all(filesID)
  // 处理一下返回的结果
  filesID = filesID.map(item=>{
    return item.fileID
  })
  // console.log(filesID);

  return filesID; 
},
  // 删除图片
  _deleteImage(e){
    // console.log(e.detail.index);
    let index=e.detail.index
    this.data.files.splice(index,1)
    this.setData({
      files:this.data.files
    })
  }
})