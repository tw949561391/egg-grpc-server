'use strict';
const GrpcCore = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');

module.exports = async app => {
    const config = app.config.grpcServer;
    const protoPath = config.protoPath;
    const extendPath = config.extendPath;

    // 创建server
    app.grpcServer = new GrpcCore.Server();
    const extendServicePath = path.join(app.baseDir, extendPath);
    app.loader.loadToApp(extendServicePath, '__grpcController', {
        initializer(model) {
            return model;
        },
    });
    await getAllServices(path.join(app.baseDir, protoPath), app, config);
    app.grpcServer.bind(`${config.host}:${config.port}`, GrpcCore.ServerCredentials.createInsecure());
    app.ready(() => {
        app.grpcServer.start();
        app.logger.info('[egg-grpc-server] grpc start on port:' + config.port);
    })
};


async function getAllServices(photoPath, app, config) {
    if (!fs.existsSync(photoPath)) {
        throw new Error('no proto file');
    }
    const photoFileList = fs.readdirSync(photoPath);
    for (const photoName of photoFileList) {
        const photoFilePath = path.join(photoPath, photoName);
        const stats = fs.statSync(photoFilePath);
        if (stats.isFile() && path.extname(photoName) === '.proto') {
            const protoObj = await protoLoader.load(photoFilePath, config.loaderOption || {});
            for (const rpcpackage in protoObj) {
                const protoServer = protoObj[rpcpackage];
                if (!protoServer) continue;
                const servicePackageClass = getControllerClassByPackageName(app['__grpcController'], rpcpackage);
                if (!servicePackageClass) continue;
                const service = buildService(protoServer, servicePackageClass, app);
                app.coreLogger.debug(`[egg-grpc-server] ${rpcpackage} init`);
                app.grpcServer.addService(protoServer, service);
            }
        }
    }
}

function getControllerClassByPackageName(controllers, packageName) {
    const ps = packageName.split(".");
    if (!ps || ps.length === 0) {
        return null;
    }
    let controller = controllers;
    for (const p of ps) {
        controller = controller[p];
        if (!controller) {
            return null;
        }
    }
    return controller;
}

function buildService(protoServer, controllerClass, app) {
    const service = {};
    for (const p in protoServer) {
        service[p] = (call, callback) => {
            const handler = new controllerClass(call, app);
            const handlerMethod = handler[p];
            if (handlerMethod) {
                handler[p]()
                    .then((data) => {
                        callback(null, data);
                    })
                    .catch((error) => {
                        callback(error)
                    })
            } else {
                callback(new Error('not implement'));
            }
        }
    }
    return service;
}