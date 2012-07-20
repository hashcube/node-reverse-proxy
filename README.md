#Reverse Proxy Server Using node-http-proxy

This reverse proxy server has been built using [node-http-proxy from nodejitsu](https://github.com/nodejitsu/node-http-proxy)

##Config File
The configuration/rules for proxying requests goes in config.json file, in this directory. 

##Default Backend
The hostname and port put in the default_backend block, becomes the default backend. Which means even if no rules are specified, all requests coming to the reverse proxy, are proxied to the default backend.

##Backend Block
Setup more backends, naming them as you like, in the backends block. The hostname and port are compulsory to specify.

##Router
Add routing rules in the router block. URLs matching the specified routing rules will be proxied to corresponding backend. All other requests will be proxied to the default backend.

##onUpgrade
The onUpgrade block is used for upgrade headers in HTTP request headers. If this is specified, all "upgrade header requests" will be proxied to the corresponding backend.

##NOTE 
Requests not matching the router block or onUpgrade, will be proxied to the default backend.
