"use strict";

// when using http.createServer we need to add the request, response and the routes code into the domain.

// usage
// curl 0.0.0.0:3000/throw
// curl 0.0.0.0:3000/file?name=server.js

var concatStream = require("concat-stream");
var domain = require("domain");
var fs = require("fs");
var http = require("http");
var url = require("url");
 
http.createServer(function (req, res) {
  var d = domain.create();

  d.on("error", function(error) {
    console.error("caught %s in the domain, shutting down", error.message);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(error.message);
    process.exit();
  });

  d.add(req);
  d.add(res);

  d.run(function() {
    var parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === "/throw" && req.method === "GET") {
      throw new Error("Pretend I am deeply nested inside library code!");
    } else if (parsedUrl.pathname === "/sum-numbers" && req.method === "POST") {
      req.pipe(concatStream(function (data) {
        var numbers = JSON.parse(data);
        var sum = numbers.reduce(function (acc, number) { return acc + number; }, 0);
         
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("Sum: " + sum);
      }));
    } else if (parsedUrl.pathname === "/file" && req.method === "GET") {
      var fileName = parsedUrl.query.name;

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      fs.createReadStream(fileName).pipe(res);
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("No content for " + req.url);
    }
  })
}).listen(3000);
 
console.log("Server running on port 3000");
