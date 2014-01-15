# Crowd-Dashboard
Crowd Dashboard aims to provide an independent website status page. It uses a client side js library to detect the online status of servers. After the first load, it can be stored on the users computer, so the original server doesn't need to be working anymore and the dashboard still works.

It uses simple JSON objects to create the lists.

## Compatibility
Crowd-Dashboard has been tested and is working in
   * Firefox 25+
   * Chrome 31
   * Internet Explorer 10

## Mirroring
As how the dashboard is set up in the repository, a similar one can be cloned by simply calling [fetch.php](fetch.php) with the correct arguments.
To do so, call `fetch.php?source=urlToOtherDashboard/`. This will fetch the other dashboard's servers.json and the mirrors.json and expands the local mirrors list by the dashboard fetched from.

After having used fetch.php please delete the file from the server.

The mirroring list only goes one way, so mirrored dashboards only have the mirrors from the dashboard, but the mirrored dashboard does not know that it has been mirrored. This will probably stay so, since spammers could simply mass-insert links otherwise.

## List Format
The list is a simple JSON file, on the top level it is an array.
The array contains serve groups, which are built like this:
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
In the _pages_ array, the objects for the pages are stored. If _withLocations_ is true, the page objects need a value in the _location_ object.
```js
{
    "name":"Page Name",
    "url":"http://humanoids.be",
    "location":"Switzerland"
}
```

Additionally, if the page provides an JSONP API to request it's status, you can set the _hasStatusAPI_ property to true. You most likely will have to define a _pageAPI_ object, the one shown in the example holds the default values, where page.host represents the host of the URL set in the page object.
```js
"pageAPI":{
    "url":"https://status.page.host/api/status.json",
    "propertyName":"status",
    "downValue":"major"
}
```

## The JS Object
For an example on how to make your dashboard work, see the [index.html](index.html) file.

```js
  var dashboard = new Dashboard();
```

Basically the js API supplied by the [crowd-dashboard.js](crowd-dashboard.js) file requires you to construct a Dashboard object, which offers the following methods:

### Methods
#### Constructor
##### Arguments
   * servers, JSON server list
   * passiveMode, false for generation of DOM list
   * elementId, id of the element the dashboard should be printed into
   
##### Description
Already tries to create the dashboard, if a valid servers list is given.

#### checkServers
Refreshes the the statuses of the servers and updates the printed list.

#### isReady
Is true if all servers have been checked.

#### clear
Resets the Dashboard object. Also clears the status list.

#### createLists
Appends the dashboard's lists to the target element.

### Attributes
#### count
Number of servers to check. Defaults to 0.

#### ready
Number of checked servers. Defaults to -1.

#### servers
The servers list, with an additional _online_ attribute, if the server has been checked. Holds true, if the server is online.

#### locationConnector
The string between the link to the page and the location link. Sanitized by the browser, so no html in there! Defaults to " in ".

#### locationURL
The URL the location gets linked to. The location string is appended after this string. Defaults to "http://maps.google.com/?q=".

#### loadingString
The string displayed inside the container while loading the dashboard. This currently isn't sanitized and just inserted into the _innerHTML_ property of the target element. Defaults to "Loading...".

#### targetNodeId
The ID of the node the dashboard is output to.

#### supportedEvents
An array of the events it supports.

#### passiveMode
Whether or not the script does not generate the DOM list, defaults to false.
  
### Events
Those won't work in IE. You can use the default _addEventListener_ and _removeEventListener_ methods to add and remove event listeners, however only the first two arguments will be processed. You can also add listeners by setting the _on[event]_ attribute.

#### ready
This event is dispatched when all servers have been checked and are ready. This event can be prevented to avoid generation of the markup.
##### Event Object Attributes
   * _length_: Number of servers

#### empty
Whenever the list is emptied (by either clearing it or handing over an empty server list), this event is fired.

## Output Markup structure
The code generated by the script in the targeted element has the following structure (the output in IE might vary):
```html
<h2 class="dashboard-title">Server List Name</h2>
<ul class="dashboard-list">
  <li class="online"><a href="http://foo.bar">Foo Bar</a></li>
  <li class="offline"><a href="http://not.online">This is offline</a></li>
</ul>
<h2 class="dashboard-title">Server List with Locations</h2>
<ul class="dashboard-list dashboard-with-locations">
  <li class="online"><a href="locat.io/n">This entry is</a> in <a class="dashboard-location" href="http://maps.google.com/?q=The%20Wonderland">The Wonderland</a></li>
</ul>
```

Note that the generation of this code and the loading indicator can be prevented by enabling passiveMode.

## [License](LICENSE)
Crowd Dashboard is licensed under the GPLv2 License.

## Pull Requests
If you fork this repository and make changes, please, please file a pull request to merge your improvements and fixes back into this repo. I will most likely merge it back in here (can't promise it, I don't want any junk here...).
