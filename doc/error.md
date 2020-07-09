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

## Timeout 

## Internal error