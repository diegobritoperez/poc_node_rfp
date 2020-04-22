var app = new Vue({
    el: "#app",

    data() {
        return {
            menu: [
                { id: "services", caption: "Services" },
                { id: "products", caption: "Products" },
                { id: "customer", caption: "Customer" },
                { id: "purchase", caption: "Purchase" },
                { id: "logistics", caption: "Logistics" }
            ],
            page: "customer",

            requests: {
                customer: [
                    { id: "getCustomer", action: "customer.customerById", rest: "/api/customer/:customer_id", method: "GET", fields: [
                    { field: "customer_id", label: "customer_id", type: "text", paramType: "url",  model: "customer_id" }
                    ], response: null, status: null, duration: null }						
                ],
                products: [
                    { id: "getProductsByCustomer", action: "products.productsByCustomer", rest: "/api/products/:customer_id", method: "GET", fields: [
                    { field: "customer_id", label: "customer_id", type: "text", paramType: "url",  model: "customer_id" }
                    ], response: null, status: null, duration: null },
                    { id: "getProductByCustomer", action: "products.productByCustomer", rest: "/api/products/:customer_id/product/:id", method: "GET", fields: [
                    { field: "customer_id", label: "customer_id", type: "text", paramType: "url",  model: "customer_id" },
                    { field: "id", label: "id", type: "text", paramType: "url",  model: "idProduct" }
                    ], response: null, status: null, duration: null }		
                ],
                services: [
                    { id: "getServicesByCustomer", action: "services.servicesByCustomer", rest: "/api/services/:customer_id", method: "GET", fields: [
                    { field: "customer_id", label: "customer_id", type: "text", paramType: "url",  model: "customer_id" }
                    ], response: null, status: null, duration: null },

                    { id: "getServiceByCustomer", action: "services.serviceByCustomer", rest: "/api/services/:customer_id/service/:id", method: "GET", fields: [
                    { field: "customer_id", label: "customer_id", type: "text", paramType: "url",  model: "customer_id" },
                    { field: "id", label: "id", type: "text", paramType: "url",  model: "idService" }
                    ], response: null, status: null, duration: null }		
                ],
                purchase: [
                    { id: "list", action: "purchase", rest: "/api/purchase/", method: "GET", response: null, status: null, duration: null },
                    { id: "purchase", action: "purchase.create", rest: "/api/purchase/", method: "POST", fields: [
                    { field: "customer_id", label: "customer_id", type: "text", paramType: "body",  model: "customer_id" },
                    { field: "item_id", label: "item", type: "text", paramType: "param",  model: "item_id" },
                    ], response: null, status: null, duration: null }	
                ],
                logistics: [
                    { id: "order", action: "logistics.order", rest: "/api/logistics/order/:id", method: "GET", fields: [
                    { field: "id", label: "id", type: "text", paramType: "url",  model: "order_id" }
                    ], response: null, status: null, duration: null }	
                ]
            },

            fields: {
                customer_id: "1234",
                idProduct: 66523546,
                idService: 98759670,
                item_id: 54634552,
                order_id: "GFFKKAS"
            },

            broker: null,
            nodes: [],
            services: [],
            actions: {},

            showBrokerOptions: false
        };
    },

    computed: {
        filteredServices() {
            return this.services.filter(svc => !svc.name.startsWith("$"));
        }
    },

    methods: {
        changePage(page) {
            this.page = page;
            this.updatePageResources();
        },

        humanize(ms) {
            return ms > 1500 ? (ms / 1500).toFixed(2) + " s" : ms + " ms";
        },

        getFieldValue(field) {
            return this.fields[field.model];
        },

        setFieldValue(field, newValue) {
            if (field.type == "number")
                this.fields[field.model] = Number(newValue);
            else
                this.fields[field.model] = newValue;
        },

        getServiceActions(svc) {
            return Object.keys(svc.actions)
                .map(name => this.actions[name])
                .filter(action => !!action);
        },

        getActionParams(action, maxLen) {
            if (action.action && action.action.params) {
                const s = Object.keys(action.action.params).join(", ");
                return s.length > maxLen ? s.substr(0, maxLen) + "…" : s;
            }
            return "-";
        },

        getActionREST(svc, action) {
            if (action.action.rest) {
                let prefix = svc.fullName || svc.name;
                if (typeof(svc.settings.rest) == "string")
                    prefix = svc.settings.rest;

                if (typeof action.action.rest == "string") {
                    if (action.action.rest.indexOf(" ") !== -1) {
                        const p = action.action.rest.split(" ");
                        return "<span class='badge'>" + p[0] + "</span> " + prefix + p[1];
                    } else {
                        return "<span class='badge'>*</span> " + prefix + action.action.rest;
                    }
                } else {
                    return "<span class='badge'>" + (action.action.rest.method || "*") + "</span> " + prefix + action.action.rest.path;
                }
            }
            return "";
        },

        callAction: function (item) {
            var startTime = Date.now();

            let url = item.rest;
            const method = item.method || "GET";
            let body = null;
            let params = null;
            if (item.fields) {
                body = {};
                params = {};
                item.fields.forEach(field => {
                    const value = this.getFieldValue(field);
                    if (field.paramType == "body")
                        body[field.field] = value;
                    else if (field.paramType == "param")
                        params[field.field] = value;
                    else if (field.paramType == "url")
                        url = url.replace(":" + field.field, value);
                });

                if (body && method == "GET") {
                    body = null;
                }
                if (params) {
                    url += "?" + new URLSearchParams(params).toString();
                }
            }

            return fetch(url, {
                method,
                body: body ? JSON.stringify(body) : null,
                headers: {
                    'Content-Type': 'application/json'
                }
                }).then(function(res) {
                    item.status = res.status;
                    item.duration = Date.now() - startTime;
                    return res.json().then(json => {
                        item.response = json;
                        if (item.afterResponse)
                            return item.afterResponse(json);
                    });
                }).catch(function (err) {
                    item.status = "ERR";
                    item.duration = Date.now() - startTime;
                    item.response = err.message;
                    console.log(err);
                });

        },

        updateBrokerOptions: function (name) {
            this.req("/api/~node/options", null).then(res => this.broker = res);
        },

        updateServiceList: function (name) {
            this.req("/api/~node/services?withActions=true", null)
                .then(res => {
                    this.services = res;
                    res.sort((a,b) => a.name.localeCompare(b.name));
                    res.forEach(svc => svc.nodes.sort());
                })
                .then(() => this.req("/api/~node/actions", null))
                .then(res => {
                    res.sort((a,b) => a.name.localeCompare(b.name));
                    const actions = res.reduce((a,b) => {
                        a[b.name] = b;
                        return a;
                    }, {});

                    Vue.set(this, "actions", actions);
                });
        },

        req: function (url, params) {
            return fetch(url, { method: "GET", body: params ? JSON.stringify(params) : null })
                .then(function(res) {
                    return res.json();
                });
        },

        updatePageResources() {
            if (this.page == 'services') return this.updateServiceList();
        }
    },

    mounted() {
        var self = this;
        setInterval(function () {
            self.updatePageResources();
        }, 2000);

        this.updateBrokerOptions();
    }
});
