'use strict';
const BaseRpc = require('../../../../../../../index').BaseGrpc;

module.exports = class Test extends BaseRpc {


  echo(call, callback) {
    this.app.logger.debug('this is a test rpc');
    const metadata = new this.grpc.Metadata();
    metadata.set('from', 'server');
    call.sendMetadata(metadata);
    // send result

    callback(null, {
      msg: `grpc test success from ${call.request.name}`,
    });
  }
};
