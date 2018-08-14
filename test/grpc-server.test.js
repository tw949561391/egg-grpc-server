'use strict';

const mock = require('egg-mock');

describe('test/grpc-server.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/grpc-server-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, grpcServer')
      .expect(200);
  });
});
