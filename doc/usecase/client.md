## Search client service with wiki page to describe data set

## Requirements
We want a service to search client from its id. We have several kind of client:
* Category D
* Category C
* Category B
* Category A
* Premium
The service must return a different response according to the client type.
To simulate the different type, we will use a client id repartition
* Category D : Client id starting with 01
* Category C : Client id starting with 02
* Category B : Client id starting with 03
* Category A : Client id starting with 04
* Premium: Client id starting with AA

## Implementation

To implement this solution, we need five response file and five trigger in our implements to manage the five case. Four conditionnal trigger and one default trigger for the default value.
So the implementation of the service:
```yaml
name: client
services:
- name: search
  method: GET
  path: /api/v1/search
  response:
    triggers:
    - type: data
      conditions:
      - "'{{.request.query.clientId}}'.startsWith('AA')"
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        bodyFile: "../responses/usecase/searchClient/premium.json"
    - type: data
      conditions:
      - "'{{.request.query.clientId}}'.startsWith('04')"
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        bodyFile: "../responses/usecase/searchClient/categoryA.json"
    - type: data
      conditions:
      - "'{{.request.query.clientId}}'.startsWith('03')"
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        bodyFile: "../responses/usecase/searchClient/categoryB.json"
    - type: data
      conditions:
      - "'{{.request.query.clientId}}'.startsWith('02')"
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        bodyFile: "../responses/usecase/searchClient/categoryC.json"
    - type: none
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        bodyFile: "../responses/usecase/searchClient/categoryD.json"
```

Execute the following statement to compile the mock system:
> Generate the mock code
`npm run start -- --input .\mocks\code\usecase\clientSearch.yml --port 7001 --projectName ClientSearch --output generated`

> Run mock
`docker-compose -f generated/docker-compose.yml up -d --build`

> Execute a GET request
GET /api/v1/search?clientId=04Z091 HTTP/1.1
Host: localhost:7001
Content-Type: application/json

After this request execution, we just have a simple json
```json
{
    "id": "043524644432",
    "type": "Category A",
    "compagny": {
        "name": "blabla",
        "location": "blabla"
    }
}
```

Now, we want to able to communicate the mock description:
* A first solution is to get the mock description

> Execute a GET request
GET /api/v1/_sourceCode HTTP/1.1
Host: localhost:7001

In response of this get request, you have the YAML mock description

* A second solution is to get the mock documentation with mock documentation tools

Execute the following statement to compile the mock system with mockDocu module:
> Generate the mock code
`npm run start -- --input .\mocks\code\usecase\clientSearch.yml --port 7001 --projectName ClientSearch --output generated --modules mockDocu`

> Run mock
`docker-compose -f generated/docker-compose.yml up -d --build`

> Navigate with your browser to http://localhost:8642/
You can see the documentation linked to your mock description