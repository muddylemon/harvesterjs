---
layout: default
title: "Harvester API"
---

### What is Harvester?

Harvester is a library that wraps express, mongoose and a few other libraries to provide JSONAPI compliant endpoints.

Get it by installing from npm (actually, this currently isn't supported): 

```
npm install harvesterjs
```

### What problems are solved by Harvester?

- JSONAPI compatibility is baked in out of the box
- Harvester handles routing and database interactions so you don't have to
- Support for exact match queries (?name=Stephen)
- Support for less than(lt), less than or equal(le), greater than(gt), greater than or equal(ge) queries (?age=gt=10)
- Support for including associated documents, ad infinitum (?includes=people.pets.toys)
- Database access is genericized through adapter api
