// pages/type/type.js
import global from "../../utils/global"
import api from "../../utils/api"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: []
  },
  onLoad() {
    this._getTypes()
  },
  // 获取所有菜谱的分类列表
  async _getTypes() {
    //  执行获取的数据
    let res = await api._get(global.tables.typeTable)
    // 需要添加临时的图片路径
    res.data.map((item, index) => {
      index++;
      item.src = "../../static/type/type0" + index + ".jpg"
    })
    this.setData({
      types: res.data
    })
  },
  //  跳转至列表页
  toListPage(e) {
    let {
      id=null,
      title,
      tag
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../list/list?typeID=${id}&title=${title}&tag=${tag}`,
    })
  }
})