/**
 *  Crowd Dashboard Javascript
 *  Created by Martin Giger in 2013
 *  Licensed under GPLv2
 *  Visit the GitHub project: http://freaktechnik.github.io/Crowd-Dashboard
 *  
 *  Credits for the status ping image hack idea to (even tough this might not be the original source): http://jsfiddle.net/Maslow/GSSCD/
 */
 
"use strict";

Dashboard.prototype.servers = [];
Dashboard.prototype.elementId = "crowd-dashboard-status-list";
Dashboard.prototype.count = 0;
Dashboard.prototype.ready = -1;
Dashboard.prototype.locationConnector = " in ";
Dashboard.prototype.locationURL = "http://maps.google.com/?q=";
Dashboard.prototype.loadingString = "Loading...";

// constructs the dashboard, checks the servers if a server array is passed. The second argument allows the Dashboard to be output to a specific element.
function Dashboard(servers, elementId) {
    if( servers ) {
        this.setServers( servers );
        if( elementId ) {
            this.setTarget( elementId );
        }

        if(!this.isReady()) {
            this.checkServers();
        }
    }
}

// Sets the servers array and checks their status
Dashboard.prototype.setServers = function(servers) {
    if( typeof servers == "object" && servers.length > 0 ) {
        this.servers = servers;
        for( var serverList in this.servers ) {
            this.count += this.servers[serverList].pages.length;
        }

        this.checkServers();
    }
    else
        this.onempty();

};

// sets the output elements ID
Dashboard.prototype.setTarget = function(elementId) {
    if( typeof elementId == "string" ) {
        this.elementId = elementId;
    }
};

// checks the status of all servers.
Dashboard.prototype.checkServers = function() {
    // not too nice way to do it, but it does the job
    document.getElementById(this.elementId).innerHTML = this.loadingString;

    var that = this;
    function getStatus(url, callback) {
        var img = new Image();
        var done = false;

        img.onload = function() {
            callback( url, true, that );
            done=true;
        };
        img.onerror = function(e) {
            //x-origin/no image
            callback( url, true, that );
            done=true;
        };

        setTimeout(function() {
            if(!done)
                callback( url, false, that );
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
        
        var rand = (statusAPI.url.indexOf('?')!=-1?'&':'?')+'timestamp='+Date.now(),
            funcName = 'processStatusAPI' + window.btoa(encodeURI(urlObj.host+rand)).replace(/[\/=]./,'');
        
        statusAPI.url += rand + '&callback=' + funcName;
        
        window[funcName] = function(response) {
            callback( url, response[statusAPI.propertyName] != statusAPI.downValue, that );
        }
            
        var script = document.createElement("script");
        script.src = statusAPI.url;
        document.body.appendChild(script);
    }

    var pageObj;
    for( var serverList in this.servers ) {
        for( var page in this.servers[serverList].pages) {
            pageObj = this.servers[serverList].pages[page];
            // for the strictness
            if(!pageObj.statusAPI)
                pageObj.statusAPI = {};
            
            if(!pageObj.hasOwnProperty("hasStatusAPI") || !pageObj.hasStatusAPI)
                getStatus(pageObj.url, addServerToList);
            else
                getStatusAPI(pageObj.url, addServerToList, pageObj.statusAPI);
        }
    }
};

// adds a server to the internal status list and initiates markup generation when all servers have been checked
function addServerToList( url, online, that ) {
    var page;
    for( var serverList in that.servers ) {
        for( var pageIndex in that.servers[serverList].pages) {
            page = that.servers[serverList].pages[pageIndex];
            if(page.url == url) {
                page.online = online;
                if(that.ready == -1)
                    that.ready = 0;
                that.ready++;
                break;
            }
        }
    }

    if(that.isReady()) {
        document.getElementById(that.elementId).innerHTML = '';
        that.createLists();
        that.onready();
    }
}

// checks if all servers have been checked
Dashboard.prototype.isReady = function() {
    return this.count == this.ready;
};

// clears the whole object
Dashboard.prototype.clear = function() {
    this.servers = {};
    this.count = 0;
    this.ready = -1;
    // not too nice way to do it, but it does the job
    document.getElementById(this.elementId).innerHTML = '';
    
    this.onempty();
};

// outputs the markup list
Dashboard.prototype.createLists = function() {
    var root = document.getElementById(this.elementId);
    var heading, list, item, link;
    for(var serverList in this.servers) {
        heading = document.createElement('h2');
        heading.classList.add('dashboard-title');
        heading.appendChild(document.createTextNode(this.servers[serverList].name));

        list = document.createElement('ul');
        list.classList.add('dashborad-list')
        if(this.servers[serverList].withLocations)
            list.classList.add('dashborad-with-locations');

        for(var page in this.servers[serverList].pages) {
            item = document.createElement('li');

            link = document.createElement('a');
            link.href = this.servers[serverList].pages[page].url;
            link.appendChild(document.createTextNode(this.servers[serverList].pages[page].name));
            item.appendChild(link);

            if(this.servers[serverList].withLocations) {
                item.appendChild(document.createTextNode(this.locationConnector));
                link = document.createElement('a');
                link.classList.add('dashboard-location');
                link.href = this.locationURL + this.servers[serverList].pages[page].location;
                link.appendChild(document.createTextNode(this.servers[serverList].pages[page].location));
                item.appendChild(link);
            }

            item.classList.add(this.servers[serverList].pages[page].online?'online':'offline');

            list.appendChild(item);
        }
        root.appendChild(heading);
        root.appendChild(list);
    }
};

Dashboard.prototype.onready = function() {
    var event = new Event('ready',{'length':this.count,'ready':this.ready});
    
    this.dispatchEvent(event);
};

Dashboard.prototype.onempty = function() {
    var event = new Event('empty');
    
    this.dispatchEvent(event);
};

//toDo: add event adding/removing/dispatching
