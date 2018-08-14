'use strict';

const grpcLoader = require('./lib/grpc-loader');

module.exports = async app => {
  await grpcLoader(app);
};
