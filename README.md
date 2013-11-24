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
In the 'pages' array, the objects for the pages are stored. If 'withLocations' is true, the page objects need a value in the 'location' object.
```js
{
    "name":"Page Name",
    "url":"http://humanoids.be",
    "location":"Switzerland"
}
```

Additionally, if the page provides an API to request it's status, you can set the 'hasStatusAPI' property to true. You most likely will have to define a 'pageAPI' object, the one shown in the example holds the default values, where page.host represents the host of the URL set in the page object.
```js
'pageAPI':{
    'url':'httpw://status.page.host/api/status.json',
    'propertyName':'status',
    'upValue':'good'
}
```

License
=======
Crowd Dashboard is licensed under the GPLv2 License.