var url = require("url"),
    http = require("http"),

    validStatusCodes = [
        //All Information Status Codes
        100, 101, 102, 118,

        //All success Status Codes
        200, 201, 202, 203, 204, 205, 206, 207,

        //All Redirect Status Codes
        300, 301, 302, 303, 304, 305, 306, 307,

        //All Client Failure Status Codes
        400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 420, 422, 423, 424,
        425, 426, 428, 429, 495, 496, 497, 499,

        //All Server Failure Status Codes
        500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 598, 599
    ],

    validProtocols = ["http:", "https:"];

function IsAlive(options) {
    "use strict";

    var self = this;

    //Set the maximal concurrent requests to 1
    http.globalAgent.maxSockets = 1;

    //Check options
    options = options || {};
    options.checkInterval = options.checkInterval || 4000;
    options.timeout = options.timeout || 500;

    this._interval = setInterval(function () {
        var item,
            server;

        for (item in self._server) {
            if (self._server.hasOwnProperty(item)) {
                server = self._server[item];
                self._check(server);
            }
        }
    }, options.checkInterval);

    this._timeout = options.timeout;
    this._server = {};
}

IsAlive.prototype.add = function (server, expectedStatusCode, cb) {
    "use strict";

    var urlParsed,
        i;


    if (typeof expectedStatusCode === "function") {
        cb = expectedStatusCode;
        expectedStatusCode = 200;
    }

    expectedStatusCode = expectedStatusCode || 200;
    if (Array.isArray(expectedStatusCode)) {
        for (i = 0; i < expectedStatusCode.length; i += 1) {
            if (validStatusCodes.indexOf(expectedStatusCode[i]) === -1) {
                cb(new Error("Excepted Status Code " + expectedStatusCode[i] + " is not a valid HTTP Status Code"));
                return;
            }
        }
    } else if (typeof expectedStatusCode === 'number') {
        if (validStatusCodes.indexOf(expectedStatusCode) === -1) {
            cb(new Error("Excepted Status Code " + expectedStatusCode + " is not a valid HTTP Status Code"));
            return;
        }

        expectedStatusCode = [expectedStatusCode];
    }

    if (typeof server !== "string") {
        cb(new Error("Server need to be an string. Got " + (typeof server)));
        return;
    } else {
        urlParsed = url.parse(server);
        if (typeof urlParsed.protocol !== 'string') {
            server = "http://" + server;
            urlParsed = url.parse(server);
        }

        if (validProtocols.indexOf(urlParsed.protocol) === -1) {
            cb(new Error("Unsupported Protocol for " + server));
            return;
        }
    }

    this._server[server] = {server: server, url: urlParsed, statusCodes: expectedStatusCode, isAlive: false};
    http.globalAgent.maxSockets += 1; //Increase maxSocket by the amount of servers added
    this._check(server);
};

IsAlive.prototype._check = function (server) {
    "use strict";

    var serverObj = this._server[server],
        self = this,
        request;

    if (typeof serverObj === "undefined") {
        return;
    }

    request = http.get(url.format(serverObj.url), function (res) {
        if (serverObj.statusCodes.indexOf(res.statusCode) !== -1) {
            self._server[server].isAlive = true;
        } else {
            self._server[server].isAlive = false;
        }
    });

    request.setTimeout(this._timeout);
    request.on('error', function () {
        self._server[server].isAlive = false;
    });
};

IsAlive.prototype.isAlive = function (server) {
    "use strict";

    if (typeof this._server[server] === "undefined") {
        return false;
    } else {
        return this._server[server].isAlive;
    }
};

module.exports = IsAlive;