'use strict';
const path = require('path');
const Grpc = require('grpc');
const traverse = require('traverse');
const fs = require('fs');

module.exports = async app => {
  const config = app.config.grpcServer;
  const protoPath = config.proto;
  const extendPath = config.extend;

  // 创建server
  app.grpcServer = new Grpc.Server();

  try {
    await getAllServices(path.join(app.baseDir, 'app', protoPath), path.join(app.baseDir, 'app', extendPath), app);
    app.grpcServer.bind(`${config.host}:${config.port}`, Grpc.ServerCredentials.createInsecure());
    app.grpcServer.start();
    app.logger.info('[egg-grpc-server] start on port:' + config.port);
  } catch (e) {
    app.logger.error('[egg-grpc-server] init proto failure:' + e.message);
  }
};

function getService(obj) {
  let serve = null;
  traverse(obj).forEach(function(proto) {
    if (this.circular) this.remove();
    if (proto.name === 'ServiceClient') {
      serve = proto;
      return false;
    }
  });
  return serve;
}


function getAllServices(photoPath, extendPath, app) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(photoPath)) {
      reject(new Error('no proto file'));
      return;
    }
    const photoFileList = fs.readdirSync(photoPath);
    photoFileList.forEach(async photoName => {
      const photoFilePath = path.join(photoPath, photoName);
      const stats = fs.statSync(photoFilePath);
      if (stats.isDirectory()) {
        const extend = path.join(extendPath, photoName);
        getAllServices(photoFilePath, extend, app);
      } else if (stats.isFile() && path.extname(photoName) === '.proto') {
        const protoObj = Grpc.load(photoFilePath, 'proto', { convertFieldsToCamelCase: true });
        const protoServer = getService(protoObj);
        if (protoServer) {
          const extend = path.join(extendPath, path.basename(photoName, path.extname(photoName)) + '.js');
          const ExtendClass = app.loader.loadFile(extend);
          if (ExtendClass) {
            const extendObj = new ExtendClass(app);
            app.grpcServer.addService(protoServer.service, extendObj);
          } else {
            app.logger.error(`[egg-server-server] the proto file [${photoFilePath}] has no extend js`);
          }
        }
      }
    });
    resolve();
  });
}
