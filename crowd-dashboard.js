/**
 *  Crowd Dashboard Javascript
 *  Created by Martin Giger in 2013
 *  Licensed under GPLv2
 *  Visit the GitHub project: http://freaktechnik.github.io/Crowd-Dashboard
 *  Version 1.1
 *  
 *  Credits for the status ping image hack idea to (even tough this might not be the original source): http://jsfiddle.net/Maslow/GSSCD/
 */
 
"use strict";

Dashboard.prototype.count = 0;
Dashboard.prototype.ready = -1;
Dashboard.prototype.locationConnector = " in ";
Dashboard.prototype.locationURL = "http://maps.google.com/?q=";
Dashboard.prototype.loadingString = "Loading...";
Dashboard.prototype.supportedEvents = ['ready', 'empty'];

/*
// Cinstructor
   constructs the dashboard, checks the servers if a server array is passed. The second argument allows the Dashboard to be output to a specific element.
*/
function Dashboard(servers, elementId) {
    if( servers ) {
        this.servers = servers;
        if( elementId ) {
            this.targetNodeId = elementId;
        }

        if(!this.isReady()) {
            this.checkServers();
        }
    }

    // Events setup
    this.eventListeners = {};

/*
// Properties with getters & setters
*/
    
    var that = this;

    // make this automated with the supported Events list
    Object.defineProperty(this, 'onready', {
        get: function() {
                return function(event) {
                    event = event && event.type == "ready" ? event : new CustomEvent('ready',{'length':that.count,'ready':that.ready});
                    that.dispatchEvent(event);
                };
            },
        set: function(fn) {
                that.addEventListener('ready',fn);
            }
    });
    
    Object.defineProperty(this, 'onempty', {
        get: function() {
                return function(event) {
                    event = event && event.type == "empty" ? event : new Event('empty');
                    that.dispatchEvent(event);
                };
            },
        set: function(fn) {
                that.addEventListener('empty',fn);
            }
    });

    var pServers = new Array();
    Object.defineProperty(this, 'servers', {
        set: function(servers) {
                if( typeof servers == "object" && servers.length > 0 ) {
                    pServers = servers;
                    that.count = 0;
                    pServers.forEach(function(serverList) {
                        this.count += serverList.pages.length;
                    }, that);
                    
                    // check if the lists actually contained pages
                    if( that.count > 0 ) {
                        that.checkServers();
                    }
                    else
                    {
                        pServers.length = 0;
                        that.onempty();
                    }
                }
                else {
                    pServers.length = 0;
                    that.onempty();
                }

            },
        get: function() {
                return pServers;
            }
    });

    var elementId = "crowd-dashboard-status-list";
    Object.defineProperty(this, 'targetNodeId', {
        set: function(val) {
                if( typeof val == "string" ) {
                    elementId = val;
                }
            },
        get: function() {
                return elementId;
            }
    });
}

/*
// Methods
*/

// checks the status of all servers.
Dashboard.prototype.checkServers = function() {
    // not too nice way to do it, but it does the job
    document.getElementById(this.targetNodeId).innerHTML = this.loadingString;

    var that = this;
    function getStatus(url, callback) {
        var img = new Image();
        var done = false;

        img.onload = function() {
            callback.call( that, url, true );
            done=true;
        };
        img.onerror = function(e) {
            //x-origin/no image
            callback.call( that, url, true );
            done=true;
        };

        setTimeout(function() {
            if(!done)
                callback.call( that, url, false );
        }, 5000);

        var rand = (url.indexOf('?')!=-1?'&':'?')+'timestamp='+Date.now();
        img.src = url+rand;
    }
    
    function getStatusAPI(url, callback, statusAPI) {
        var urlObj = {"host":url.match(/:\/\/([a-z0-9\.:].*)/)[1]};
    
        // set default values
        statusAPI.url = statusAPI.url || 'https://status.' + urlObj.host + '/api/status.json';
        statusAPI.propertyName = statusAPI.propertyName || "status";
        statusAPI.downValue = statusAPI.downValue || "major";
        
        // timestamp to avoid caching
        var rand = (statusAPI.url.indexOf('?')!=-1?'&':'?')+'timestamp='+Date.now(),
            funcName = 'processStatusAPI' + window.btoa(encodeURI(urlObj.host+rand)).replace(/[\/=]./,'');
        
        statusAPI.url += rand + '&callback=' + funcName;
        
        window[funcName] = function(response) {
            callback.call( that, url, response[statusAPI.propertyName] != statusAPI.downValue );
        }
            
        var script = document.createElement("script");
        script.src = statusAPI.url;
        document.body.appendChild(script);
    }

    var pageObj;
    this.servers.forEach(function(serverList) {
        serverList.pages.forEach(function(pageObj) {
            // for the strictness
            if(!pageObj.statusAPI)
                pageObj.statusAPI = {};
            
            if(!pageObj.hasOwnProperty("hasStatusAPI") || !pageObj.hasStatusAPI)
                getStatus(pageObj.url, this.addServerToList);
            else
                getStatusAPI(pageObj.url, this.addServerToList, pageObj.statusAPI);
        }, this);
    }, this);
};

// adds a server to the internal status list and initiates markup generation when all servers have been checked
Dashboard.prototype.addServerToList( url, online ) {
    this.servers.forEach(function(serverList) {
        serverList.pages.forEach(function(page) {
            if(page.url == url) {
                page.online = online;
                if(this.ready == -1)
                    this.ready = 0;
                this.ready++;
                break;
            }
        }, this);
    }, this);

    if(this.isReady()) {
        var e = new CustomEvent('ready',{'length':this.count,'ready':this.ready});
        this.onready(e);

        if(!e.defaultPrevented) {
            document.getElementById(this.targetNodeId).innerHTML = '';
            this.createLists();
        }
    }
}

// checks if all servers have been checked
Dashboard.prototype.isReady = function() {
    return this.count == this.ready;
};

// clears the whole object
Dashboard.prototype.clear = function() {
    this.servers.length = 0;
    this.count = 0;
    this.ready = -1;
    // not too nice way to do it, but it does the job
    document.getElementById(this.targetNodeId).innerHTML = '';

    this.onempty();
    this.eventListeners = {};
};

// outputs the markup list
Dashboard.prototype.createLists = function() {
    var root = document.getElementById(this.targetNodeId);
    var heading, list, item, link;
    this.servers.forEach(function(serverList) {
        heading = document.createElement('h2');
        heading.classList.add('dashboard-title');
        heading.appendChild(document.createTextNode(serverList.name));

        list = document.createElement('ul');
        list.classList.add('dashboard-list')
        if(serverList.withLocations)
            list.classList.add('dashboard-with-locations');

        serverList.pages.forEach(function(page) {
            item = document.createElement('li');

            link = document.createElement('a');
            link.href = page.url;
            link.appendChild(document.createTextNode(page.name));
            item.appendChild(link);

            if(serverList.withLocations) {
                item.appendChild(document.createTextNode(this.locationConnector));
                link = document.createElement('a');
                link.classList.add('dashboard-location');
                link.href = this.locationURL + page.location;
                link.appendChild(document.createTextNode(page.location));
                item.appendChild(link);
            }

            item.classList.add(page.online?'online':'offline');

            list.appendChild(item);
        }, this);
        root.appendChild(heading);
        root.appendChild(list);
    }, this);
};

/**
 *  Simple event listener/sender pattern
 *  this does not support propagation control (bubbling/preventingDefault etc.)
 */

Dashboard.prototype.eventListeners = {};

Dashboard.prototype.addEventListener = function(type, fn) {
    // construct the array for this eventtype, if it's not yet existing.
    if( !this.eventListeners[type] )
        this.eventListeners[type] = new Array();

    this.eventListeners[type].push(fn);
};

Dashboard.prototype.removeEventListener = function(type, fn) {
    for(var listener in this.eventListeners[type]) {
        if( this.eventListeners[type][listener] == fn )
            this.eventListeners[type].splice(listener,1);
    }
    
    // delete the eventtype property if there are no more listeners.
    if( this.eventListeners[type].length == 0 ) {
        delete this.eventListeners[type];
    }
};

Dashboard.prototype.dispatchEvent = function(d_eventObject) {
    if( this.eventListeners[d_eventObject.type] && this.eventListeners[d_eventObject.type].length > 0 ) {
        this.eventListeners[d_eventObject.type].forEach(function(listener) {
            listener(d_eventObject);
        });
    }
};
 