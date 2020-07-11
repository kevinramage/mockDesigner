# Manage error

## Method not allow
Mock designer propose a default method not allow message when you request no match with any routes presents in your mock.
You can override this default message with the statement default, this statement work as an action list.

Example
```yaml
name: methodNotAllow
default:
- type: message
  status: 405
  headers:
    Content-Type: application/json
  body: "{ \"message\": \"Invalid request: method not allow\" }"
services:
  - name: basicService
    method: GET
    path: /api/v1/basicService
    ...
```

## Internal error
Mock designer propose a default method do send internal error if an exception occured during the request processing.
You can override this default message with the statement error, this statement work as an action list.

Example:
```yaml
name: methodNotAllow
error:
- type: message
  status: 500
  headers:
    Content-Type: application/json
  body: "{ \"message\": \"You destroy the system :/ !!! \" }"
services:
  - name: basicService
    method: GET
    path: /api/v1/basicService
```

## Next feature

* System to manage timeout