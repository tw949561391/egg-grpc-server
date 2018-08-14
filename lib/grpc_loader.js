'use strict';
const path = require('path');
const Grpc = require('grpc');
const fs = require('fs');

module.exports = async app => {
  const config = app.config.grpcServer;
  const protoPath = config.proto;
  const extendPath = config.extend;

  // 创建server
  app.grpcServer = new Grpc.Server();
  try {
    const extendServicePath = path.join(app.baseDir, 'app', extendPath);
    app.loader.loadToApp(extendServicePath, 'grpcController', {
      initializer(model) {
        return new model(app);
      },
    });
    await getAllServices(path.join(app.baseDir, 'app', protoPath), app);
    app.grpcServer.bind(`${config.host}:${config.port}`, Grpc.ServerCredentials.createInsecure());
    app.grpcServer.start();
    app.logger.info('[egg-grpc-server] start on port:' + config.port);
  } catch (e) {
    app.logger.error('[egg-grpc-server] init proto failure:' + e.message);
  }
};

function getService(obj) {

  for (const p in obj) {
    if (obj[p].name === 'ServiceClient') {
      const service = obj[p];
      service._name = p;
      return service;
    }
  }
  return null;
}


function getAllServices(photoPath, app) {
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
        await getAllServices(photoFilePath, app);
      } else if (stats.isFile() && path.extname(photoName) === '.proto') {
        const protoObj = Grpc.load(photoFilePath, 'proto', { convertFieldsToCamelCase: true });
        for (const rpcpackage in protoObj) {
          const protoServer = getService(protoObj[rpcpackage]);
          if (!protoServer) continue;
          const servicePackage = app.grpcController[rpcpackage];
          if (!servicePackage) continue;
          app.grpcServer.addService(protoServer.service, servicePackage[protoServer._name]);
        }
      }
    });
    resolve();
  });
}
