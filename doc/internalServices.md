# Internal Services

Mock designer propose differents internal services to help the administration.
Mock designer propose a solution to get request and response on a service.

## Get request and response

### Define keys for your service

On request storage section, define a keys section to retrieve request and response with these keys.
The request and response will be saved 48 hours. 
If a new request received with the same keys values, the new request will erase the existing one.
Take care, the order of the keys definition is important. 

```yaml
  - name: basicService
    method: GET
    path: /api/v1/basicService/:id
    requestStorage:
      keys:
      - "{{.request.params.id}}"
      - "{{.request.body.deliveryId}}"
```

### Call service to get request and response

Call the service "_getRequest" to get request and response.
The service name query must be defined.
To define query parameters, define the first key with the query key parameter "key1", define the second key with the query key parameter "key2" ...

```
GET /api/v1/_getRequest?serviceName=basicService&key1=1234&key2=1
```

## Ping
A basic ping to check if the service is available
```
GET /api/v1/myServiceName/_ping
```

## Behaviour
A system to get, create, update, delete behaviour instances

**Get all behaviours**
```
GET /api/v1/myServiceName/_behaviour
```
**Get a behaviour**
```
GET /api/v1/myServiceName/_behaviour/ERROR_500
```
**Create behaviour**
```
POST /api/v1/myServiceName/_behaviour
content-Type: application/json

{
    "name": "ERROR_500"
    "expired": 3600
}
```
Expired property is optionnal property. By default a behaviour defined for 10 hours.

**Update behaviour**
```
PUT /api/v1/myServiceName/_behaviour/ERROR_500
content-Type: application/json

{
    "name": "ERROR_500"
    "expired": 3600
}
```
**Delete all behaviours**
```
DELETE /api/v1/myServiceName/_behaviour
```

## Service counter

**Get Service counter**
```
GET /api/v1/myServiceName/_getServiceCounter
```

**Reset Service counter**
```
POST /api/v1/myServiceName/_resetServiceCounter
```

**Update Service counter**
```
PUT /api/v1/myServiceName/_updateServiceCounter
content-Type: application/json

{
    "value": 10
}
```

## Database service

**Get database value**
```
GET /api/v1/_getDatabaseValue?name=myKey
```

**Reset database counter**
```
POST /api/v1/_resetDatabaseCounter
content-Type: application/json

{
    "name": "myCounter"
}
```

**Update database value**
```
PUT /api/v1/_updateDatabaseValue
content-Type: application/json

{
    "name": "myCounter",
    "value": 10
}
```

**Delete database value**
```
DELETE /api/v1/_deleteDatabaseCounter?name=myKey
```

## Source Code

Get the source code of the mock deployed with the following request:

> Execute a GET request
GET /api/v1/_sourceCode HTTP/1.1
Host: localhost:7001