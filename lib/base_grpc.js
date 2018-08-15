'use strict';

class BaseGrpc {
    constructor(call, app) {
        this.call = call;
        this.app = app;
        this.metadata = new Metadata();
    }
}

module.exports = BaseGrpc;
