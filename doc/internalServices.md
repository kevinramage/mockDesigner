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