# egg-grpc-server

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-grpc-server.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-grpc-server
[travis-image]: https://img.shields.io/travis/eggjs/egg-grpc-server.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-grpc-server
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-grpc-server.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-grpc-server?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-grpc-server.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-grpc-server
[snyk-image]: https://snyk.io/test/npm/egg-grpc-server/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-grpc-server
[download-image]: https://img.shields.io/npm/dm/egg-grpc-server.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-grpc-server

<!--
Description here.
-->

## Install

```bash
$ npm i grpc -g
$ npm i egg-grpc-server --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.grpcServer = {
  enable: true,
  package: 'egg-grpc-server',
};
```

## Configuration

```js
// {app_root}/config/config.default.js

exports.grpcServer = {
    protoPath: 'app/grpc',  //*.proto path
    extendPath: 'app/grpc', //service path
    host: '0.0.0.0',
    port: '50051',
    loaderOption: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
};

```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->
```js
// {app_root}/app/grpc/ProfileService.proto
    syntax = "proto3";
    
    package passport.auth;
    
    service AuthService {
        rpc roles (UserReq) returns (UserRes) {
    
        }
    }
    
    message UserReq {
        string userId = 1;
        string clientId = 2;
    }
    
    message UserRes{
        string userId = 1;
        string clientId = 2;
    }
    
    
    // {app_root}/app/grpc/passport/profile/ProfileService.js
    const BaseGrpc = require('egg-grpc-server').BaseGrpc;
    
    class ProfileService extends BaseGrpc {
        async getUserInfo() {
            this.app.coreLogger.info("echo");
            const params = this.call.request;
            const user = await this.app.model.User.findOne({where: {userId: params.userId}});
            if (!user) throw  new Error('user_none');
            return {
                userId: user.userId,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                gender: user.gender
            }
        }
    }

module.exports = ProfileService;

```


see [demo](https://github.com/tw949561391/egg-grpc-server/tree/master/test/fixtures/apps/grpc-server-test/app/grpc) for more detail.


## client
Please open an issue [egg-grpc-client](https://www.npmjs.com/package/egg-grpc-client).


## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
