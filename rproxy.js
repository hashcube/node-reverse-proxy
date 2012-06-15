var fs = require('fs');
var httpProxy = require('http-proxy');
var http = require('http');
var https = require('https');
//var conf = require('./conf.js');
var url = require('url');

var config_file = "/etc/hc-rproxy/config.json";
var config;

try {
  config = JSON.parse(fs.readFileSync(config_file, 'utf-8'));
} catch(err) {
  if(err.errno == 34) {
    console.error("FATAL ERROR: Can't find config file ", config_file);
    process.exit(1);
  }
  else {
    console.error(err);
  }
}

var backends = {};
var secure_server = false;

var https_options = {
  key: fs.readFileSync(config.SSL_PRIVATE_KEY, 'utf8'),
  cert: fs.readFileSync(config.SSL_CERT, 'utf8')
};

// Parsing and setting up backends from the config file
for(i in config.backends) {
  var target = {};
  target.host = config.backends[i].host;
  target.port = config.backends[i].port;
  if(config.backends[i].https) {
    target.https = config.backends[i].https;
    secure_server = config.backends[i];
  }
  backends[i] = new httpProxy.HttpProxy({target: target}); 
}

// Setup the rules for backends from config file
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
      //TODO:  find out a way to find out the protocol
      // referer doesnt work
      /*if(url.parse(req.headers.referer).protocol === 'https:' && secure_server) {
        console.log(req.url, ' proxying to ', secure_server);
        backends.secure_server.proxyRequest(req, res);
      }
      else {*/
        console.log(req.url, ' proxying to default backend');
        backends.default_backend.proxyRequest(req, res);
      //}
    }
  });
  
  server.on('upgrade', function(req, socket, head) {
    console.log('UPGRADING HEADER FOUND!');
    console.log(req.headers);
    console.log(req.url, ' proxying to ', config.onUpgrade);
    backends[config.onUpgrade].proxyWebSocketRequest(req, socket, head);
  });
};

var server = http.createServer();
var https_server = https.createServer(https_options);
setupServer(server);
setupServer(https_server);

server.listen(80);
https_server.listen(443);

console.log('Ready to proxy requests. Listening on port 80...');
console.log('Ready to proxy requests. Listening on port 443...');

