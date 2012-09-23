Djanky
======

An altogether unecesary little web framework inspired by Django

Quick Hits
----------

    var djanky = require('djanky');

    function index(request, response, name) {
        return 'Hello, ' + name + '!';
    }

    var routes = [
        ['^/(.*)$', index, 'index']
    ];

    var server = new djanky.Server(1337, routes);

    server.start();

Exposed Objects
---------------

### Server

The core Djanky class.

#### Constructor

`new djanky.Server( _&lt;port>_ , _&lt;routes_ )`

##### Parameters

* `port` - The port to listen to. Defaults to 8080.
* `routes` an Array of routes, stored as an Array of 3 values:
    * `[_pattern_, _handler_, _name_]`

### Error404

* TODO: write this.

### Error500

* TODO: write this.