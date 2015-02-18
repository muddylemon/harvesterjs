---
layout: page
title: "JSONAPI_Error"
category: har
date: 2015-02-17 20:16:01
---

JSONAPI compliant error class, which inherits from the native Error and allows you to supply an http status, detail, href and title parameters.

```javascript
var JSONAPI_Error = Harvest.JSONAPI_Error;

throw new JSONAPI_Error({
                status: 500,
                detail: errorMessage,
                title: errorTitle,
                href: errorHref
            });

```
####Parameters
- options (Object): Optional; Supplies error details to end users.
-- status (Number): HTTP code reported when this error is thrown.
-- detail (String): Detail message sent to end users when this error is thrown.
-- title (String): Message title sent to end users when this error is thrown.
-- href (String): Error link sent to end users when this error is thrown.


