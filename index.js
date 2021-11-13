var fs = require('fs');
var http = require('http');
var https = require('https');
var proxyrequest = require('request');
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var hosts = {"proxytest1.beispiel.de" : "https://google.com", "proxytest2.beispiel.de" : "https://heise.de"};

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80);
httpsServer.listen(443);

app.get('*', (request, response) => {
    console.log(request.url);
    if(!request.secure) {
        response.redirect('https://' + request.headers.host + request.url);
        console.log("Connection was insecure. Redirected to HTTPS");                
    } else {                        
        var newhost = hosts[request.headers.host];
        if(typeof newhost != 'undefined') {
            console.log("Request for " + request.headers.host + " was proxied to " + newhost);
            proxyrequest(newhost + request.url).pipe(response);
        } else {
            response.send("404");
        }        
    }    
    
    
});

console.log("Launched!");
