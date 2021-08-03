const vm = new Vue({
	el: '#app',
	data: {
        sourceLoading: false,
		db: window.database.get(),
		categories: [],
		productList: []
	},
	mounted: async function() {
        const vm = this;
		// await vm.productCategoriesUpgrade();

		const categories = await vm.db.table(window.database.PRODUCT_CATEGORIES_COLLECTION_NAME).orderBy('ordering').toArray();
		vm.categories = categories;

		// await vm.productsUpgrade();

		const productList = await vm.db.table(window.database.PRODUCT_LIST_COLLECTION_NAME).limit(20).toArray();
		vm.productList = productList;
	},
	methods: {
        handleLinkCopy: function(productId) {
			const vm = this;
			const link = 'https://detail.1688.com/offer/' + productId + '.html?from=pages';
            navigator.clipboard.writeText(link).then(function() {
				vm.$message({'type': 'success', 'message': '链接已复制'});
			}).catch(() => {});
        },
		productCategoriesUpgrade: async function() {
			const vm = this;
			const response = await axios.get('../data/categories.json');
			if ( response.status != 200 ) return vm.$message({'type': 'error', 'message': '数据加载失败'});

			const data = response.data;
			const cateTable = vm.db.table(window.database.PRODUCT_CATEGORIES_COLLECTION_NAME);
			const result = await cateTable.bulkPut(data);
	
		},
		productsUpgrade: async function () {
			const vm = this;
			const response = await axios.get('../data/list/2.json');
			if ( response.status != 200 ) return vm.$message({'type': 'error', 'message': '数据加载失败'});

			const data = response.data;
			const productTable = vm.db.table(window.database.PRODUCT_LIST_COLLECTION_NAME);
			for(let item of data) item.id = item.productID;
			// console.log('data:', data);
			const result = await productTable.bulkPut(data);
		}
	}
});
