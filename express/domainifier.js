"use strict";

// a middleware that wrap the req, res, and the next function in a domain.
// The idea behind domains is to centralizing the handling of unexpected errors.
// 
// On unexpected error we kill the process instead of using the default 
// express error handler and letting our process monitor (forever or pm2) 
// take care of starting the app. It's a good idea to kill the process since 
// we don't know if our app is in stable state.

var domain = require('domain');

module.exports = function domainifier(req, res, next) {
  var d = domain.create();

  d.on("error", function (error) {
    console.error("caught %s in main domain, shutting down", error.message);
    res.end(500, "Unexpected error - " + error.message + " Shutting down");
    process.exit(1);
  });

  d.add(req);
  d.add(res);
  d.add(next);
  d.run(next);
};

