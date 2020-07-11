## Login service with conditionnal response

## Requirements
We want to simulate a login service, this service authenticate the user from a username and a password sent in request body. 
To simulate authentication failed, we will use the username "userAuthFailed", if we received this username, mock system must send an 403 authentication failed.

## Implementation
First, we will write a basic service
```yaml
name: loginMock
services:
- name: loginService
  method: POST
  path: /api/v1/login
  response:
    triggers:
    - type: none
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        body: "{ \"code\": 200, \"message\": \"Authentication succeed\", \"sessionId\": \"123456\" }"
```

Execute the following statement to compile the mock system:
> Generate the mock code
`npm run start -- --input .\mocks\code\usecase\login.yml --port 7001 --projectName Login --output generated`

> Run mock
`docker-compose -f generated/docker-compose.yml up -d --build`

> Execute a GET request
POST /api/v1/login HTTP/1.1
Host: localhost:7001
Content-Type: application/json

{
    "username": "userAuthFailed",
    "password": "1234"
}

After this request execution, we just have a simple json
```json
{
    "code": 200,
    "message": "Authentication succeed",
    "sessionId": "123456"
}
```

Now must include a condition in our response. We will add a new data trigger to generate the error response. [More informations about this trigger](https://github.com/kevinramage/mockDesigner/blob/master/doc/dataTrigger.md).
So now, we have two triggers, one trigger with condition and a second trigger, the default trigger.
The first trigger will manage the error case, we just have to add a condition to check username parameter equals to 'userAuthFailed'. 
The second trigger will manage the classical case.

```yaml
name: loginMock
services:
- name: loginService
  method: POST
  path: /api/v1/login
  response:
    triggers:
    - type: data
      conditions:
      - "'{{.request.body.username}}' == 'userAuthFailed'"
      actions:
      - type: message
        status: 403
        headers:
          content-type: application/json
        body: "{ \"code\": 403, \"message\": \"Authentication failed\" }"
    - type: none
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        body: "{ \"code\": 200, \"message\": \"Authentication succeed\", \"sessionId\": \"123456\" }"
```

Now, we just have to generate the code and run it and we have the following response:
```json
{
    "code": 403,
    "message": "Authentication failed"
}
```