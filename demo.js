var djanky = require('./djanky');

function index(request, response) {
    response.setHeader("Content-Type", "text/html");
    return '<h1>Hello!</h1> Might I interest you in the <a href="docs/">docs</a>?';
}

var routes = [
    ['^/docs(.+)$', djanky.serve_static('docs')],
    ['^/$', index, 'index']
];

var server = new djanky.Server(1337, routes);

server.start();

console.log('Check me out on port 1337!');
