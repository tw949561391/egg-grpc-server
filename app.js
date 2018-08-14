'use strict';

const grpcLoader = require('./lib/grpc_loader');

module.exports = async app => {
  await grpcLoader(app);
};
