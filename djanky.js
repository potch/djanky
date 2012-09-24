// Djanky- the little framework that shouldn't.

// version 0.1.x
// "You probably shouldn't use this for anything important quite yet."

// Copyright 2012 Matt Claypotch.
// Licensed under MIT for your future enjoyment.

// http://github.com/potch/djanky

// Are you seeing these docs when you thought you would see your beautiful
// site? Make sure you're passing a properly-formatted `routes` list to
// `djanky.Server`.


// Getting our imports out of the way.

var fs = require('fs');
var http = require('http');
var _ = require('underscore');


// ## djanky.Server
// The Business™

function Server(port, routes) {

    // Initializes with the following parameters:

    // * `port` (optional) - the port to listen to. Defaults to 8080.
    // * `routes` - an Array of URL-routing tuples (described below). Defaults to
    // a Hello World route that serves these docs.

    var self = this;

    self.port = port || 8080;

    // ### What are routes?
    // In Djanky, a route is simply an Array containing a URL pattern to match
    // against the request, a handler function to handle the request, and an
    // optional name (only used for logging/debugging right now).

    // A sample route looks like this:

    //     [ '^/(.*)$', index, 'index' ]

    // The first parameter is a regex that matches a URL of / followed by
    // anything. By using the parens, we capture that portion of the request
    // URL and it will be provided to the handling method as a parameter.

    // The second parameter is a reference to a function. In this case we have
    // a function `index` in our file that will generate the response. The
    // signature of `index` would look like this:

    //     function index(request, response, name) {

    // The first two parameters are references to node's `http.ServerRequest`
    // and `http.ServerResponse` objects for this request.

    // The `routes` parameter of `Server` is an Array of these Arrays.

    self.routes = routes || [['^(.+)$', serve_static('docs')]];


    // This is the method we pass to `http.Server` to dispatch incoming
    // requests.

    function requestHandler(req, res) {
        var responseBody;
        try {
            responseBody = self.serve(req, res);
        } catch (e) {
            if (e instanceof Error404) {
                console.log('Error 404: ' + e.message);
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end(e.message);
            } else if (e instanceof Error500) {
                console.log('Error 500: ' + e.message);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end(e.message);
            } else {
                console.log(e.fileName, e.lineNumber, e.message);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end(e.message);
            }
        }
        res.writeHead(200);
        res.end(responseBody);
    }

    // If you need to bug the internal `http.Server`, it's a public property.
    self.server = http.createServer(requestHandler);
}
Server.prototype = {
    serve: function(req, res) {
        var self = this;
        var route = matchRoute(self.routes, req.url);
        var view = route[0][1];
        var viewName = route[0][2] || route[0][0];
        if (!view) {
            throw new Error500('View for ' + viewName + ' not found!');
        }
        var args = [req, res].concat(route[1].slice(1));
        console.log(viewName + ' matches ' + req.url);
        return view.apply(this, args);
    },
    start: function() {
        var self = this;
        self.server.listen(self.port, '127.0.0.1');
        console.log('listening on port ' + self.port);
    }
};


// ## djanky.Error404
// when we throw this, return the user a 404 error.

// parameters:

// * `message` (optional) - A custom message to pass on.

function Error404(message) {
    this.status = 404;
    this.message = message || "Resource not found!";
}
Error404.prototype = new Error();
Error404.prototype.constructor = Error404;


// ## djanky.Error500
// when we throw this, return the user a 500 error.

// parameters:

// * `message` (optional) - A custom message to pass on.

function Error500(message) {
    this.status = 500;
    this.message = message || "Something went wrong!";
}
Error500.prototype = new Error();
Error500.prototype.constructor = Error500;


// ## djanky.serve_static
// A helper when you need to serve a directory as static files.
// Use this in your routes in place of a handler function:

//     [ '^/media/(.*)$', djanky.serve_static('media/'), 'media' ]

// parameters:

// * `root` - the root path to serve statically.

function serve_static(root) {
    root = process.cwd() + '/' + root;
    console.log('setting up static serving from ' + root);
    return function(req, res, path) {
        try {
            if (path[path.length-1] === '/') {
                path += 'index.html';
            }
            return fs.readFileSync(root + path);
        } catch (e) {
            throw new Error404('No file found for ' + root + path);
        }
    };
}


// The naive and simple Routing mechanism.

function matchRoute(routes, url) {
    // We just iterate through the provided routes and use the first one
    // that matches the request URL.
    for (var i=0; i<routes.length; i++) {
        var route = routes[i];
        var reg = new RegExp(route[0]);
        var match = url.match(reg);
        if (match) {
            // Return both the matching route, and the RegExp match array
            // so we can pass that data on to the handler.
            return [route, match];
        }
    }
    // No matches found? 404!
    throw new Error404('No matching route found for ' + url);
}


// Pack up our module with the goodies and send it on its way!
module.exports = {
    Server: Server,
    Error404: Error404,
    Error500: Error500,
    serve_static: serve_static
};
