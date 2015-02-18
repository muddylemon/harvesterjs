---
layout: page
title: "Install & Setup"
category: doc
date: 2015-02-17 19:21:47
---
####BASIC USAGE

Here is a minimal application that exposes two resources that can link to each other:

```javascript
var harvester = require('harvester')
  , app = harvester({
    db: 'petstore'
  })
  .resource('person', {
    name: String,
    age: Number,
    pets: ['pet'] // "has many" relationship to pets
  })
  .resource('pet', {
    name: String,
    age: Number,
    owner: 'person' // "belongs to" relationship to a person
  })
  .listen(1337);
```

This exposes a few routes for the person and pet resources:

|HTTP|	Person|	Pet|	Notes|
|:--------------|:--------------|:-------------|:-----------------------|
|GET|	/people|	/pets|	Get a collection of resources, accepts query ?ids=1,2,3...|
|POST|	/people|	/pets|	Create a resource|
|GET|	/people/:id|	/pets/:id|	Get a specific resource, or multiple: 1,2,3|
|PUT|	/people/:id|	/pets/:id|	Create or update a resource|
|PATCH|	/people/:id|	/pets/:id|	Patch a resource (see RFC 6902)|
|DELETE|	/people/:id|	/pets/:id|	Delete a resource|
|GET|	/people/:id/pets|	/pets/:id/owner|	Get a related resource (one level deep)|