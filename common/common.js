// ------------------------------------------------------------------------------------
// 本地数据库，用来提升系统的性能
// ------------------------------------------------------------------------------------
window.database = {
    PRODUCT_CATEGORIES_COLLECTION_NAME: 'productCategories',
    defines: {
        website: [
            {
                version: 1,
                schema: {
                    productCategories: '&id,name,shapeText,ordering',
                    productList: '&id,sku,&child',
                    compBatches: 'id,date,insertTime',
                    compImages: '++id,batchId,sku,index,rowId,pageId,height,insertTime' // [batchId+pageId]
                },
                upgrade: function (tx) {
                    // 官网例子有错误，这里必须toCollection，否则会报modify is not a function错误
                    // return tx.batches.toCollection().modify(batch => {
                    // 	delete batch._id
                    // })
                }
            }
        ]
    },
    instances: [],
    get: function (dbName='website', tables = {}, version = 1) {
        let _this = this;
        if ((dbName in _this.instances) === false) {
            const db = new Dexie(dbName);
            _this.defines[dbName].forEach(function (version) {
                db.version(version.version).stores(version.schema).upgrade(tx => { return version.upgrade(tx) });
            });
            // 必须有open动作，否则在db不存在时，不会自动创建
            db.open().catch(function(error) {
                console.log('open error: ', error);
            })
            _this.instances[dbName] = db;
        }
        return _this.instances[dbName];
    }
}