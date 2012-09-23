var djanky = require('./index');

function index(request, response, name) {
    return 'Hello, ' + name + '!';
}

var routes = [
    ['^/(.*)$', index, 'index']
];

var server = new djanky.Server(1337, routes);

server.start();