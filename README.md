# Crowd-Dashboard
Crowd Dashboard aims to provide an independent website status page. It uses a client side js library to detect the online status of servers. After the first load, it can be stored on the users computer, so the original server doesn't need to be working anymore and the dashboard still works.

It uses simple JSON objects to create the lists.

## Compatibility
Crowd-Dashboard has been tested and is working in
   * Firefox 25+
   * Chrome 31
   * Internet Explorer 10

It might work in non-browser JS environements. However it uses the Image object (Status Ping) as well as the (window.)document tree for certain functions (JSONP, Markup output).

## Mirroring
As how the dashboard is set up in the repository, a similar one can be cloned by simply calling [fetch.php](example/fetch.php) with the correct arguments.
To do so, call `fetch.php?source=urlToOtherDashboard/`. This will fetch the other dashboard's servers.json and the mirrors.json and expands the local mirrors list by the dashboard fetched from.

After having used fetch.php please delete the file from the server.

The mirroring list only goes one way, so mirrored dashboards only have the mirrors from the dashboard, but the mirrored dashboard does not know that it has been mirrored. This will probably stay so, since spammers could simply mass-insert links otherwise.

## List Format
The list is a simple JSON file, on the top level it is an array.
The array contains server groups, which are built like this:
```js
{
    "name":"Group Name",
    "withLocations":true,
    "pages":
        [
        ]
}
```
The _name_ property will be printed as a h2 header-element.
In the _pages_ array, the objects for the pages are stored. If _withLocations_ is true, the page objects _location_ value is needed. They _type_ property defines how the status is checked. Crowd-Dashboard currently supports "workaround" (Default) for status checks of non-CORS pages, "request" to check the status via XMLHttpRequest (needs the header of the page to specify the proper CORS access), "JSON" and "JSONP" for status APIs. The _timeout_ value defines how long to wait (in ms) before marking a page as unavailable This works for each type except JSONP. Currently the url is  treated as unique identifier.
```js
{
    "name":"Page Name",
    "url":"http://humanoids.be",
    "location":"Switzerland",
    "timeout":5000,
    "type":"workaround"
}
```

Additionally, if the page provides a JSON(P) API to request it's status, you can set the _type_ property to "JSON" or "JSONP" respectively. You most likely will have to define a _statusAPI_ object, the one shown in the example holds the default values, where page.host represents the host of the URL set in the page object. If the property _upValue_ is present, it is prefered over the _downValue_. _upValue_ and _downValue_ can also be arrays. The property's value is then checked against each array item and has to match (_upValue_) or be different to (_downValue_) at least one in order for the site to be considered as online. If the _propertyName_ contains one or more dots, it is assumed that it represents a structure of properties, allowing you to navigate through objects. The JSONP Api function needs a document element in the global scope which offers a DOM API.
```js
"statusAPI":{
    "url":"https://status.page.host/api/status.json",
    "propertyName":"status",
    "downValue":"major"
}
```

Alternatively to the dots you can use _nestedProperty_ (assumed as false by default) to declare that _propertyName_ is an array of property names to navigate through. Not only does this allow you to have dots in the property names, but you can also select items of traditional arrays.
```js
"statusAPI:{
    "url":"http://status.page.host/api/status.json",
    "nestedProperty": true,
    "propertyName":[
        "page",
        0,
        "status"
    ],
    "upValue":"online"
}
```

## The JS Object
For an example on how to make your dashboard work, see the [index.html](example/index.html) file.

```js
  var dashboard = new Dashboard();
```

Basically the js API supplied by the [crowd-dashboard.js](crowd-dashboard.js) file requires you to construct a Dashboard object, which offers the following methods:

### Methods
#### Constructor
##### Arguments
   * [_servers_]: JSON server list
   * [_passiveMode_]: false for generation of DOM list
   * [_elementId_]: id of the element the dashboard should be printed into
   
##### Description
Already tries to create the dashboard, if a valid servers list is given.

#### setListAttributes
##### Arguments
   * [_targetNodeId_]: ID of the new target node
   * [_locationConnector_]: new location connector
   * [_locationURL_]: new location URL

#####
To avoid updating the DOM multiple times when setting new values to multiple of the three properties _targetNodeId_,_locationConnector_ and _locationURL_ you can set them using this method. If you vant to omit one of the first two arguments you may do so by passing '''null'''.

#### checkServers
Refreshes the the statuses of the servers and updates the printed list.

#### checkServer
##### Arguments
   * _server_: A page object.

##### Description
Checks the status of a single server and saves it. If it was the last server to be ready, the ready event is fired.

#### addServerToList
##### Arguments
   * _url_: the URL of the server
   * _status_: whether or not the server is online

##### Description
Sets the state of a server in the list.

#### getServerByURL
##### Arguments
   * _url_: URL of the server

##### Description
Returns the page object with the specified URL.

#### isReady
Is true if all servers have been checked.

#### clear
Resets the Dashboard object. Also clears the status list.

#### createLists
Appends the dashboard's lists to the target element.

### Attributes
#### totalCount
Number of servers to check. Defaults to 0.

#### readyCount
Number of checked servers. Defaults to -1.

#### servers
The servers list, with an additional _online_ attribute, if the server has been checked. Holds true, if the server is online. This updates the list if _passiveMode_ is false.

#### locationConnector
The string between the link to the page and the location link. Sanitized by the browser, so no html in there! Defaults to " in ". This updates the list if _passiveMode_ is false.

#### locationURL
The URL the location gets linked to. The location string is appended after this string. Defaults to "http://maps.google.com/?q=". This updates the list if _passiveMode_ is false.

#### loadingString
The string displayed inside the container while loading the dashboard. This currently isn't sanitized and just inserted into the _innerHTML_ property of the target element. Defaults to "Loading...". If the loading string is currently shown and _passiveMode_ is false, it is changed.

#### targetNodeId
The ID of the node the dashboard is output to. This prints the list in the new node if _passiveMode_ is not true.

#### supportedEvents
An array of the events it supports.

#### passiveMode
Whether or not the script does not generate the DOM list, defaults to false if the global scope has a document element. If changed to true, the list is immediately output to the target node.
  
### Events
Those won't work in IE. You can use the default _addEventListener_ and _removeEventListener_ methods to add and remove event listeners, however only the first two arguments will be processed. You can also add listeners by setting the _on[event]_ attribute.

#### ready
This event is dispatched when all servers have been checked and are ready. This event can be prevented to avoid generation of the markup.
##### Event Object Details Attributes
   * _length_: Number of servers

#### itemready
When a server is successfully checked for its online status this event is fired. If this event is prevented, the online status of the element in the markup list is not updated.
##### Event Object Detauls Attributes
The server item (same contents as the JSON object, just with an additional field _online_) is passed as event data.

#### empty
Whenever the list is emptied (by either clearing it or handing over an empty server list), this event is fired.

## Output Markup structure
The code generated by the script in the targeted element has the following structure (the output in IE might vary):
```html
<h2 class="dashboard-title">Server List Name</h2>
<ul class="dashboard-list">
  <li id="dashboard-item-aHvL2h1bWFub2lkcy5iZQ" class="online"><a href="http://foo.bar">Foo Bar</a></li>
  <li id="dashboard-item-BGR0cDovL2h1bWFub2cb9edR" class="offline"><a href="http://not.online">This is offline</a></li>
</ul>
<h2 class="dashboard-title">Server List with Locations</h2>
<ul class="dashboard-list dashboard-with-locations">
  <li id="dashboard-item-aHR0cDovL2hEv5sd68rRd" class="online"><a href="locat.io/n">This entry is</a> in <a class="dashboard-location" href="http://maps.google.com/?q=The%20Wonderland">The Wonderland</a></li>
</ul>
```

Note that the generation of this code and the loading indicator can be prevented by enabling passiveMode. When initially generated a list item is neither online nor offline. The class will be added as soon as the status is clear.

## [License](LICENSE)
Crowd Dashboard is licensed under the GPLv2 License.

## Pull Requests
If you fork this repository and make changes, please, please file a pull request to merge your improvements and fixes back into this repo. I will most likely merge it back in here (can't promise it, I don't want any junk here...).
