"use strict";

const DbMixin = require("../mixins/db.mixin");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
    name: "customer",
    mixins: [DbMixin("customer")],
	settings: {
        fields: [
			"_id",
			"customer_id",
			"name",
			"document_type",
			"document_id"
		]
	},
	dependencies: [],
	actions: {
        customerById: {
			rest: {
				method: "GET",
				path: "/:customer_id"
            },
            params: {
				customer_id: "string"
			},
            async handler(ctx) {
				const customer = await this.adapter.findOne({ customer_id : ctx.params.customer_id });
				if(customer){
					return customer;
				}else{
					return{
						"status": "Customer Not Found."
					}
				}
			}
        }
	},
	events: {

	},
	methods: {

	},
	created() {

	},
	async started() {

	},
	async stopped() {

	}
};
