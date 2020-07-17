## Retrieve an offer from the catalog

## Requirements
We want a service to retrieve an offer from a catalog. For testing purpose, we don't need to have a specific offer, we want have random offer to test with random values.

## Implementation
First, we will write a basic service
```yaml
name: catalogMock
services:
- name: catalogService
  method: GET
  path: /api/v1/offer/:id
  response:
    triggers:
    - type: none
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        body: "{ \"id\": \"OFF_MEDIA_1\", \"name\": \"Media 1\", \"product\": \"PRD_MEDIA_1\", \"startDate\": \"2020/01/01\", \"expiredDate\": \"2020/12/01\" }"
```

Execute the following statement to compile the mock system:
> Generate the mock code
`npm run start -- --input .\mocks\code\usecase\catalog.yml --port 7001 --projectName Catalog --output generated`

> Run mock
`docker-compose -f generated/docker-compose.yml up -d --build`

> Execute a GET request
GET /api/v1/offer/1 HTTP/1.1
Host: localhost:7001
Content-Type: application/json

After this request execution, we just have a simple json
```json
{
    "id": "OFF_MEDIA_1",
    "name": "Media 1",
    "product": "PRD_MEDIA_1",
    "startDate": "2020/01/01",
    "expiredDate": "2020/12/01"
}
```

To have random data, we just have to create a data source. Add offers data in the data source:
**mocks/data/usecase/offers.json**
```json
[
{ "id": "OFF_MEDIA_1", "name": "Media 1", "product": "PRD_MEDIA_1", "startDate": "2020/01/01", "expiredDate": "2020/12/01" },
{ "id": "OFF_MEDIA_2", "name": "Media 2", "product": "PRD_MEDIA_2", "startDate": "2020/01/01", "expiredDate": "2020/12/01" },
{ "id": "OFF_MEDIA_3", "name": "Media 3", "product": "PRD_MEDIA_3", "startDate": "2020/01/01", "expiredDate": "2020/12/01" },
{ "id": "OFF_MEDIA_4", "name": "Media 4", "product": "PRD_MEDIA_4", "startDate": "2020/01/01", "expiredDate": "2020/12/01" },
{ "id": "OFF_MEDIA_5", "name": "Media 5", "product": "PRD_MEDIA_5", "startDate": "2020/01/01", "expiredDate": "2020/12/01" }
]
```

After to help the readability of the mock description, we will describe the response in an external file:

**mocks/responses/usecase/offer.json**
```json
{
    "id": "{{.data.offers.id}}",
    "name": "{{.data.offers.name}}",
    "product": "{{.data.offers.product}}",
    "startDate": "{{.data.offers.startDate}}",
    "expiredDate": "{{.data.offers.expiredDate}}"
}
```

Now, we just have to change the mock description to refer this new response file:

```yaml
name: catalogMock
services:
- name: catalogService
  method: GET
  path: /api/v1/offer/:id
  response:
    triggers:
    - type: none
      actions:
      - type: message
        status: 200
        headers:
          content-type: application/json
        bodyFile: ./usecase/offer.json
```

Now, we just have to generate the code and run it and we have the following response:
```json
{
    "id": "OFF_MEDIA_2",
    "name": "Media 2",
    "product": "PRD_MEDIA_2",
    "startDate": "2020/01/01",
    "expiredDate": "2020/12/01"
}
```