"use strict";

const DbMixin = require("../mixins/db.mixin");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
    name: "services",
    mixins: [DbMixin("services")],
	settings: {
        fields: [
			"_id",
			"customer_id",
			"service"
		]
	},
	dependencies: [],
	actions: {
		async addServices(ctx) {
			const services = await this.adapter.findOne({ customer_id : ctx.params.customer_id });
			let service = {
				"id":ctx.params.item.id,
				"name":ctx.params.item.name,
				"start":null,
				"end":null,
				"status":"pending"
			}
			const doc = await this.adapter.updateById(services._id, { $push: {service:service}});
			const json = await this.transformDocuments(ctx, ctx.params, doc);
			await this.entityChanged("updated", json, ctx);
			return true;
		},
        servicesByCustomer: {
			rest: {
				method: "GET",
				path: "/:customer_id"
            },
            params: {
				customer_id: "string"
			},
            async handler(ctx) {
				const services = await this.adapter.findOne({ customer_id : ctx.params.customer_id });
				if(services){
					delete services['_id'];
					return services;
				}else{
					return{
						"status": "Services Not Found"
					}
				}
			}
        },
        serviceByCustomer: {
			rest: {
				method: "GET",
				path: "/:customer_id/service/:id"
            },
            params: {
                id: "string",
                customer_id: "string"
                
			},
            async handler(ctx) {
				console.log(ctx.params.id)
				var services = await this.adapter.findOne( { customer_id : ctx.params.customer_id });
				console.log(services)
				if(services){
					console.log(services.services)
					var service = services.services.filter(service => service.id == ctx.params.id)
					return service;
				}else{
					return{
						"status": "Services Not Found"
					}
				}
			}
        }
	}
};
