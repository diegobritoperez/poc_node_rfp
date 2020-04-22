"use strict";

const DbMixin = require("../mixins/db.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
    name: "products",
    mixins: [DbMixin("products")],
	settings: {
        fields: [
			"_id",
			"customer_id",
			"product"
		]
	},
	dependencies: [],
	actions: {
		async addProduct(ctx) {
			const products = await this.adapter.findOne({ customer_id : ctx.params.customer_id });
			let orderCode = Math.random().toString(36).substr(2, 7);
			let product = {
				"id":ctx.params.product.id,
				"name":ctx.params.product.name,
				"brand":null,
				"category":null,
				"status":"pending",
				"deliveryOrdeId":orderCode
			}
			const doc = await this.adapter.updateById(products._id, { $push: {product:product}});
			const json = await this.transformDocuments(ctx, ctx.params, doc);
			await this.entityChanged("updated", json, ctx);
			await ctx.call("logistics.addOrder", {orderCode:orderCode});
			return true;
		},
        productsByCustomer: {
			rest: {
				method: "GET",
				path: "/:customer_id"
            },
            params: {
				customer_id: "string"
			},
            async handler(ctx) {
                const products = await this.adapter.findOne({ customer_id : ctx.params.customer_id });
                if(products){
                    delete products['_id'];
                    return products;
                }else{
                    return {
						"status": "Products Not Found"
					}
                }
			}
        },
        productByCustomer: {
			rest: {
				method: "GET",
				path: "/:customer_id/product/:id"
            },
            params: {
                id: "string",
                customer_id: "string"
                
			},
            async handler(ctx) {
                var products = await this.adapter.find({ $and: [ { customer_id : ctx.params.customer_id } , { "product": { id:  ctx.params.id} } ] });
                if(products){
                    delete products[0]['_id'];
                    var product = products[0].product.filter(product => product.id == ctx.params.id)
				    return product[0];
                }else{
                    return {
						"status": "Product Not Found"
					}
                }
			}
        }
	}
};
