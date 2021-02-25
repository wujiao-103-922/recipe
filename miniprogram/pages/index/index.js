import global from "../../utils/global"
import api from "../../utils/api"

Page({
    data: {
        types:[],
        recipes:[]
    },
    onLoad(){
        this._getHotRecipe()
        this._getTypes()
    },
    // 查询热门菜谱---views
    async _getHotRecipe(){
        // 查询
        let res = await api._getByPage(global.tables.recipeTable,{status:1},{field:"views",sort:"desc"},6)
        // console.log(res);
            // 通过每个菜谱的openid,去用户表中去查询个人信息
        let userAll=[]
        res.data.map((item,index)=>{
        let result = api._get(global.tables.userTable,{_openid:item._openid})
        userAll.push(result)
        })
        userAll =  await Promise.all(userAll)
        // console.log(userAll);
        // 给每一个菜谱数据  添加遮罩层控制属性
        res.data.map((item,index)=>{
       
            item.userInfo = userAll[index].data[0].userInfo
        })

        this.setData({
            recipes:res.data
        })

        
    },
    // 获取菜谱分类  limit=2  
    async _getTypes(){
        let res = await api._getByPage(global.tables.typeTable,{},{field:"_id",sort:"desc"},2,1)
        // console.log(res);

        // 由于上传时，没有进行图片的上传，；临时给两个图片
        res.data[0].src = "../../imgs/index_07.jpg"
        res.data[1].src = "../../imgs/index_09.jpg"

        this.setData({
            types:res.data
        })
    },
    // 跳转至分类页面
    toTypePage(){
        wx.navigateTo({
          url: '../type/type',
        })
    },
    // 跳转至列表页
    toListPage(e) {
        let {
          id=null,
          title,
          tag
        } = e.currentTarget.dataset
        wx.navigateTo({
          url: `../list/list?typeID=${id}&title=${title}&tag=${tag}`,
        })
      },
    //   跳转至详情页
    toDetail(e){
        let {id} = e.currentTarget.dataset
        wx.navigateTo({
          url: '../detail/detail?id='+id,
        })
    }

})