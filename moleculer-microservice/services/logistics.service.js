"use strict";

const DbMixin = require("../mixins/db.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
    name: "logistics",
    mixins: [DbMixin("logistics")],
	settings: {
        fields: [
            "_id",
            "order",
            "eta",
            "tracking"
		]
	},
	dependencies: [],
	actions: {
		async addOrder(ctx){
			const order = 
			{
				"order":ctx.params.orderCode,
				"eta":1586044800,
				"tracking":
				[
					{"status":"started","timestamp":1585729174}
				]
			}
		
			const doc = await this.adapter.insert(order);
			const json = await this.transformDocuments(ctx, ctx.params, doc);
			await this.entityChanged("updated", json, ctx);
			return true;
		},
        order: {
			rest: {
				method: "GET",
				path: "/order/:id"
            },
            params: {
                id: "string"
            },
            async handler(ctx) {
                const findOrder = await this.adapter.findOne({order:ctx.params.id});
                if(findOrder){
                    delete findOrder['_id'];
				    return findOrder;    
                }else{
                    return {
						"status": "Order Not Found"
					}
                }
                
			}
		},
	}
};
