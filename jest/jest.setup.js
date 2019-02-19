global.td = require('testdouble');
global.httpMocks = require('node-mocks-http');
global.anyArgs = { ignoreExtraArgs: true };
require('testdouble-jest')(td, jest);
