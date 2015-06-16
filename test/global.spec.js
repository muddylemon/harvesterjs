var app = require('./app.js');

beforeEach(app.createDefault);
afterEach(app.destroy);
