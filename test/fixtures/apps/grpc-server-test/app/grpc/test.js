'use strict';

module.exports = app => {
  class Test {
    constructor(grpc) {

    }
    echo(call, callback) {
      app.coreLogger.debug('this is a test rpc');
      const metadata = new this.grpc.Metadata();
      metadata.set('from', 'server');
      call.sendMetadata(metadata);
      // send result
      callback(null, {
        msg: `grpc test success from ${call.request.name}`,
      });
    }
  }
  return Test;
};
