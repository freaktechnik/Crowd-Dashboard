Crowd-Dashboard
===============
Crowd Dashboard aims to provide an independent website status page. It uses a client side js library to detect the online status of servers. After the first load, it can be stored on the users computer, so the original server doesn't need to be working anymore and the dashboard still works.

It uses simple JSON objects to create the lists.

List Format
===========
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

Additionally, if the page provides an API to request it's status, you can set the _hasStatusAPI_ property to true. You most likely will have to define a _pageAPI_ object, the one shown in the example holds the default values, where page.host represents the host of the URL set in the page object.
```js
"pageAPI":{
    "url":"https://status.page.host/api/status.json",
    "propertyName":"status",
    "upValue":"good"
}
```

Setting up your Dashboard
=========================
For an example on how to make your dashboard work, see the [index.html](index.html) file.

Basically the js API requires you to construct a Dashboard object, which offers the following methods:

Constructor
-----------
Arguments:
   * servers, JSON server list
   * elementId, id of the element the dashboard should be printed into
   
Already tries to create the dashboard, if a valid servers list is given.
  
setServers
----------
Arguments:
   * servers, JSON server list

Set the servers list object.

setTarget
---------
Arguments:
   * elementId, id of the element the dashboard should be printed into
   
Set the target element the dashboard is output into.

checkServers
------------
Refreshes the the statuses of the servers and updates the printed list.

isReady
-------
Is true if all servers have been checked.

[License](LICENSE)
=======
Crowd Dashboard is licensed under the GPLv2 License.
