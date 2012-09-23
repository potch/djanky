Djanky
======

An altogether unecesary little web framework inspired by Django

Quick Hits
----------

    var djanky = require('djanky');

    function index(request, response, name) {
        return 'Hello, '' + name + '!';
    }

    var routes = ['^(.*)$', index, 'index'];

    var server = new djanky.Server(1337, routes);

    server.start();

Exposed Objects
---------------

### Server

* TODO: write this.

### Error404

* TODO: write this.

### Error500

* TODO: write this.