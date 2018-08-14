'use strict';

/**
 * egg-grpc-server default config
 * @member Config#grpcServer
 * @property {String} SOME_KEY - some description
 */
exports.grpcServer = {
  proto: 'proto',
  extend: 'grpc',
  host: '0.0.0.0',
  port: '5050',
};
