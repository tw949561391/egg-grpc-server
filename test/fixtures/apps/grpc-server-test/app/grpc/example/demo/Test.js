'use strict';
const BaseRpc = require('../../../../../../../../index').BaseGrpc;

module.exports = class Test extends BaseRpc {
    async Echo() {
        return {
            msg: `grpc test success `,
        }
    }
};
