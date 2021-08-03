const STORAGE_PRODUCT_DATA_VERSION = "product_data_version";
const STORAGE_CATEGORY_DATA_VERSION = "category_data_version";

const vm = new Vue({
	el: '#app',
	data: {
        sourceLoading: false,
		db: window.database.get(),
		categories: [],
		productList: [],
		categoryId: null
	},
	mounted: async function() {
        const vm = this;

		const categories = await vm.db.table(window.database.PRODUCT_CATEGORIES_COLLECTION_NAME).orderBy('ordering').toArray();
		vm.categories = categories;
		
		// vm.handleProductSearch();
		vm.update();
	},
	methods: {
        handleLinkCopy: function(productId) {
			const vm = this;
			const link = 'https://detail.1688.com/offer/' + productId + '.html?from=pages';
            navigator.clipboard.writeText(link).then(function() {
				vm.$message({'type': 'success', 'message': '链接已复制'});
			}).catch(() => {});
        },
		handleProductSearch: async function () {
			const where = {};
			if (this.categoryId) where['groupID'] = this.categoryId;
			const productList = await vm.db.table(window.database.PRODUCT_LIST_COLLECTION_NAME).where(where).limit(20).toArray();
			vm.productList = productList;
		},
		handleCategoryChange: function(category) {
			this.categoryId = category.id;
			this.handleProductSearch();
		},
		categoryUpgrade: async function(updates) {
			const vm = this;
			const categoryTable = vm.db.table(window.database.PRODUCT_CATEGORIES_COLLECTION_NAME);
			// localStorage 中的键值对总是以字符串的形式存储，这也意味值getItem得到的总是字符串
			const localVersion = parseInt(window.localStorage.getItem(STORAGE_CATEGORY_DATA_VERSION));
			let newVersion = isNaN(localVersion) ? 0 : localVersion;;

			for(const update of updates) {
				// 当客户端第一次执行更新请求时，localVersion为null，这种情况下应该更新所有数据
				if (localVersion || update.version <= localVersion) continue;
				
				const response = await axios.get('../../' + update.link);
				if ( response.status != 200 ) return vm.$message({'type': 'error', 'message': '数据加载失败'});
	
				const data = response.data;
				const result = await categoryTable.bulkPut(data);

				// 更新完成后，需要在本地保存更新数据的最大版本号
				if(update.version > newVersion) newVersion = update.version;
			}

			window.localStorage.setItem(STORAGE_CATEGORY_DATA_VERSION, newVersion);
		},
		productUpgrade: async function (updates) {
			const vm = this;
			const productTable = vm.db.table(window.database.PRODUCT_LIST_COLLECTION_NAME);
			// localStorage 中的键值对总是以字符串的形式存储，这也意味值getItem得到的总是字符串
			const localVersion = parseInt(window.localStorage.getItem(STORAGE_PRODUCT_DATA_VERSION));
			let newVersion = isNaN(localVersion) ? 0 : localVersion;
			
			for(const update of updates) {
				// 当客户端第一次执行更新请求时，localVersion为null，这种情况下应该更新所有数据
				if (localVersion || update.version <= localVersion) continue;
				
				const response = await axios.get('../../' + update.link);
				if ( response.status != 200 ) return vm.$message({'type': 'error', 'message': '数据加载失败'});
	
				const data = response.data;
				
				for(let item of data) item.id = item.productID;
				const result = await productTable.bulkPut(data);

				// 更新完成后，需要在本地保存更新数据的最大版本号
				if(update.version > newVersion) newVersion = update.version;
			}

			window.localStorage.setItem(STORAGE_PRODUCT_DATA_VERSION, newVersion);
		},
		update: async function() {
			const productDataVersion = window.localStorage.getItem(STORAGE_PRODUCT_DATA_VERSION);
			const response = await axios.get('../../updates.json');
			const updates = response.data;

			this.productUpgrade(updates.product);
			this.categoryUpgrade(updates.category);
		}
	}
});
