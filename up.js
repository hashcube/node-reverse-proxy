var up = require('up')
, fs = require('fs')
, Config = require('./utils');

var config_file = "/Users/emacsian/work/hashcube/tools/rproxy/up_config.json";
var srv = new Array();
var config;

config = new Config().get(config_file);

for(i in config.ports) {

  var protocol = 'http';
  var options;

  if(config.ports[i] == 443) {
    options = {
      key: fs.readFileSync(config.SSL_PRIVATE_KEY, 'utf8'),
      cert: fs.readFileSync(config.SSL_CERT, 'utf8')
    };
    protocol = 'https';
  }

  var server = require(protocol).createServer(options).listen(config.ports[i]);
  srv.push(up(server, __dirname + '/rproxy', {workerTimeout: '10s', numWorkers: 1}));
}

process.on('SIGUSR2', function () {
  for(i in srv) {
    srv[i].reload();
  }
});
