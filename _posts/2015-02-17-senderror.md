---
layout: page
title: "sendError"
category: har
date: 2015-02-17 20:16:50
order: 15
---

Sends a JSONAPI error on the supplied route, consuming either a JSONAPI error, or a regular error object.


```
harvester.sendError (req, res, error)
```

####Parameters
- req (Object): the express request object
- res (Object): the express response object
- error (Object): either a JSONAPI error or a regular error object.