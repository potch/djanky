var fs = require('fs');
var http = require('http');
var _ = require('underscore');

function Server(port, routes) {
    var self = this;

    self.routes = routes || [];
    self.port = port || 8080;

    function requestHandler(req, res) {
        try {
            var responseBody = self.serve(req, res);
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
    self.server = http.createServer(requestHandler);
}
Server.prototype = {
    serve: function(req, res) {
        var self = this;
        var route = matchRoute(self.routes, req.url);
        var view = route[0][1];
        var viewName = route[0][2] || route[0][1];
        if (!view) {
            throw new Error500('View for ' + viewName + ' not found!');
        }
        var args = [req, res].concat(route[1].slice(1));
        console.log(viewName + ' matches ' + req.url);
        return view.apply(this, args);
        throw new Error404();
    },
    start: function() {
        var self = this;
        self.server.listen(self.port, '127.0.0.1');
        console.log('listening on port ' + self.port);
    }
};

function Error404(message) {
    this.status = 404;
    this.message = message || "Resource not found!";
}
Error404.prototype = new Error();
Error404.prototype.constructor = Error404;

function Error500(message) {
    this.status = 500;
    this.message = message || "Something went wrong!";
}
Error500.prototype = new Error();
Error500.prototype.constructor = Error500;

function serve_static(root) {
    root = process.cwd() + '/' + root;
    console.log('setting up static serving from ' + root);
    return function(req, res, path) {
        try {
            return fs.readFileSync(root + path);
        } catch (e) {
            throw new Error404('No media found for ' + root + path);
        }
    };
}

function matchRoute(routes, url) {
    for (var i=0; i<routes.length; i++) {
        var route = routes[i];
        var reg = new RegExp(route[0]);
        var match = url.match(reg);
        if (match) {
            return [route, match];
        }
    }
    // no matches found?
    throw new Error404('No matching route found for ' + url);
}

module.exports = {
    Server: Server,
    Error404: Error404,
    Error500: Error500,
    serve_static: serve_static
};
