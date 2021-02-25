// 操作数据库api
const db = wx.cloud.database()

// 添加
const _add = (collection,data={})=>{
    // 没有添加callback ,直接返回promiss
   return db.collection(collection).add({data})
}
// 获取
// 1.条件查询获取多条数据
const _get = async(collection,where={})=>{
    // return db.collection(collection).where(where).get()
    const MAX_LIMIT = 20
    // 先取出集合记录总数
    const countResult = await db.collection(collection).count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection(collection).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
    }
    // 
    if((await Promise.all(tasks)).length <= 0){
        return {
            data:null
        }
    }
    // 等待所有 reduce 自带循环 拼接
    return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
            data: acc.data.concat(cur.data)
        }
    })
}
// 2.分页查询
const _getByPage = async(collection,where={},orderBy={field:"_id",sort:"desc"},limit=4,page=1)=>{   
    // page 1   limit 4   skip 0
    // page 2   limit 4   skip 4
    // page 3   limit 4    skip 8  （page-1）*limit
    let skip = (page-1)*limit;
    return db.collection(collection).where(where).skip(skip).orderBy(orderBy.field, orderBy.sort).limit(limit).get()
}
// 3.通过id查询
const _getById = async (collection,id)=>{
   return db.collection(collection).doc(id).get()
}
// 删除
// 1.id删除一条数据
const _del = (collection,id="")=>{
    // 没有添加callback ,直接返回promiss
   return db.collection(collection).doc(id).remove()
}
// 2.通过where条件删除
const _delByWhere=(collection,where={})=>{
    // 没有添加callback，直接返回promis
    return db.collection(collection).where(where).remove()
}
// 更新
const _editOne = (collection,_id="",data={})=>{
    // 没有添加callback ,直接返回promiss
   return db.collection(collection).doc(_id).update({data})
}
export default{
    _add,
    _get,
    _del,
    _editOne,
    _getByPage,
    _getById,
    db,
    _delByWhere
}