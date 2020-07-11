# Basic service with request informations

## Requirements
We want to simulate a simple service, this service send an hello word message with the username parameter sent from the request.
We want to listen on path /api/v1/helloService on GET method. We will use username query parameter to collect the username.

## Implementation
First, we will write a basic service
```yaml
name: helloWorldMock
services:
- name: helloWorldService
  method: GET
  path: /api/v1/helloService
  response:
    triggers:
    - type: none
      actions:
      - type: message
        status: 200
        body: "Hello world"
```

Execute the following statement to compile the mock system:
> Generate the mock code
`npm run start -- --input .\mocks\code\usecase\basic.yml --port 7001 --projectName Basic --output generated`

> Run mock
`docker-compose -f generated/docker-compose.yml up -d --build`

> Execute a GET request
GET /api/v1/helloService?username=Kevin HTTP/1.1
Host: localhost:7001

After this request execution, we just have a simple "Hello World" message.
To improve this message, we want to display the user name query parameter.
To implement this feature, we just have to add an expression in body statement ([Documentation](https://github.com/kevinramage/mockDesigner/blob/master/doc/request.md)).
We just have this expression {{.request.query.username}}.

The new mock description with this new expression:
```yaml
name: helloWorldMock
services:
- name: helloWorldService
  method: GET
  path: /api/v1/helloService
  response:
    triggers:
    - type: none
      actions:
      - type: message
        status: 200
        body: "Hello world {{.request.query.username}}"
```

Now, we just have to generate the code and run it and we have the following response:
Hello world Kevin