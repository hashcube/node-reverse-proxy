var fs = require('fs')
, httpProxy = require('http-proxy')
, http = require('http')
, url = require('url')
, Config = require('./utils');


var config_file = "/home/hashcube/server/www/tools/rproxy/config.json";
var backends = {};
var config = new Config().get(config_file);
var server = http.createServer();

/* Load and parse Config file */
function loadConfig() {
  // Parsing and setting up backends from the config file
  for(i in config.backends) {
    backends[i] = new httpProxy.HttpProxy({
      target: {
        host : config.backends[i].host,
        port : config.backends[i].port
      }
    });
    // Catch proxy errors and send 500
    backends[i].on('proxyError', function(err, req, res) {
      console.log(err);
      if(err.code == 'ECONNREFUSED') {
        console.log('Unable to proxy to target server. This probably means the target server '+
                    'is not listening on the given port or host');
      }
      res.writeHead(500, {'Content-type': 'text/html'});
      res.end('<h3> Internal Server Error </h3> Well this is embarrassing. Please try again.');
    });
  }
}

/* Setup proxy rules for backends from config file */
var setupServer = function (server) {
  server.on('request', function(req, res) {
    var matched = false;
    for(i in config.router) {
      if(req.url.match(i)) {
        console.log(req.headers);
        console.log(req.url, ' proxying to ', config.router[i]);
        backends[config.router[i]].proxyRequest(req, res);
        matched = true;
        break;
      }
    }
    if(!matched) {
      console.log(req.headers);
      console.log(req.url);
      console.log(req.url, ' proxying to default backend');
      console.log('x-forwarded',req.headers['x-forwarded-proto']);
      backends.default_backend.proxyRequest(req, res);
    }
  });

  server.on('upgrade', function(req, socket, head) {
    console.log('UPGRADING HEADER FOUND!');
    console.log(req.headers);
    console.log(req.url, ' proxying to ', config.onUpgrade);
    backends[config.onUpgrade].proxyWebSocketRequest(req, socket, head);
  });
};

loadConfig();
setupServer(server);

module.exports = server;
