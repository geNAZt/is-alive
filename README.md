is-alive
========

Is-Alive checks servers if they are responding anymore

Example on how to add a alive runner to a server
```javascript
var IsAlive = require('is-alive');
var isAlive = new IsAlive();
isAlive.add("http://google.com", 301, function (err) {
    "use strict";

    if (err) {
        console.log(err);
    }
});

setInterval(function () {
    console.log(isAlive.isAlive("http://google.com"));
}, 2000);

console.log(isAlive.isAlive("http://google.com"));
```

Optional Parameters in the constructor:

```javascript
options.checkInterval = options.checkInterval || 4000; //The interval in which all Servers are checked. In ms
options.timeout = options.timeout || 500; //The timeout value after which are server dead
```

Methods:

add(server, statusCodes, cb):

* server: The Server must be a http or https Adress. It gets parsed via the url.parse from NodeJS.
* statusCodes: Can be a number or an array of numbers. If the Statuscode of a request is one in this the server is alive
* cb: function(err) Gets an error if some of the data is wrong.

Return: always undefined

isAlive(server):

* server: The Server that has been given via add(server,...)

Return: true if server is alive, false if not found in isAlive or offline