'use strict';
const path = require('path');
const Grpc = require('grpc');
const fs = require('fs');
const protoLoader = require('@grpc/proto-loader');

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
        await getAllServices(path.join(app.baseDir, 'app', protoPath), app, config);
        app.grpcServer.bind(`${config.host}:${config.port}`, Grpc.ServerCredentials.createInsecure());
        app.ready(() => {
            app.grpcServer.start();
            app.logger.info('[egg-grpc-server] grpc start on port:' + config.port);
        })
    } catch (e) {
        app.logger.error('[egg-grpc-server] init proto failure:' + e.message);
    }
};


async function getAllServices(photoPath, app, config) {
    if (!fs.existsSync(photoPath)) {
        throw new Error('no proto file');
    }
    const photoFileList = fs.readdirSync(photoPath);
    for (const photoName of photoFileList) {
        const photoFilePath = path.join(photoPath, photoName);
        const stats = fs.statSync(photoFilePath);
        if (stats.isDirectory()) {
            await getAllServices(photoFilePath, app, config);
        } else if (stats.isFile() && path.extname(photoName) === '.proto') {
            const protoObj = await protoLoader.load(photoFilePath, config.loaderOption || {});
            for (const rpcpackage in protoObj) {
                const protoServer = protoObj[rpcpackage];
                if (!protoServer) continue;
                const servicePackage = getControllerByPackageName(app.grpcController, rpcpackage);
                if (!servicePackage) continue;
                app.logger.debug(`[egg-grpc-server] ${rpcpackage} init`)
                app.grpcServer.addService(protoServer, servicePackage);
            }
        } else {
            app.logger.debug(`[egg-grpc-server] ${photoName} unknow file`)
        }
    }
}

function getControllerByPackageName(controllers, packageName) {
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
