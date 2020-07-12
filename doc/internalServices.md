# Internal Services

Mock designer propose differents internal services to help the administration.

### Ping
A basic ping to check if the service is available
```
GET /api/v1/myServiceName/_ping
```

### Behaviour
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

### Service counter

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

### Database service

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

**Source Code**

Get the source code of the mock deployed with the following request:

> Execute a GET request
GET /api/v1/_sourceCode HTTP/1.1
Host: localhost:7001