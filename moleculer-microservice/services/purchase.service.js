"use strict";

const DbMixin = require("../mixins/db.mixin");
const ApiGwService = require("moleculer-web");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
    name: "purchase",
    mixins: [DbMixin("purchase")],
	settings: {
        fields: [
			"_id",
			"items"
		]
	},
	dependencies: [],
	actions: {
		async create(ctx){
            const itemToPurchase = await this.adapter.findOne();
			var avali = itemToPurchase.items.find(item => item.id == ctx.params.item_id);
			if(avali){
				if(avali.type == "sva"){
					if(await ctx.call('services.addServices', {item: avali, customer_id: ctx.params.customer_id})){
						return{
							"status": "Purchase ok. Pending activation"
						}
					}
				}
				if(avali.type == "product"){
					if(await ctx.call('products.addProduct', {product: avali, customer_id: ctx.params.customer_id})){
						return{
							"status": "Purchase ok. Pending activation"
						}
					}
				}
				return{
					"status": "Item Not Found"
				}
			}else{
				return {
					"status": "Item Not Found"
				}
			}
        },
        list: {
			rest: {
				method: "GET",
				path: "/"
            },
            async handler() {
				const itemToPurchase = await this.adapter.findOne();
				if(itemToPurchase){
					delete itemToPurchase['_id'];
					return itemToPurchase;
				}else{
					return {
						"status": "Items Not Found"
					}
				}
			}
		}
	}
};
