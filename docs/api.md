## API

### Monitoring

Mock Designer propose solutions to monitor requests sent and responses provided. This feature can be used to check your application behaviour, compare requests sent to mock system and requests expected.

**GET /mockdesigner/monitoring/requests**
Get requests received, you can have all informations about the request and the reponse provided.
By default the system return 10 requests maximum, you can change this limit with the query parameter "limit".
By default there are no filter on request provided, you can filter requests with query parameters "filterKey" and "filterValue".
Requests provided are sorted by date.

**GET /mockdesigner/monitoring/responses**
Get responses sent, you can have all informations about the response and the request linked.
By default the system return 10 responses maximum, you can change this limit with the query parameter "limit".
By default there are no filter on response provided, you can filter responses with query parameters "filterKey" and "filterValue".
Responses provided are sorted by date.

## Options

Services are available to manage options

GET /mockdesigner/api/option
Get all options defined on system

GET /mockdesigner/api/option/:key
Get a specific option from its name

PUT /mockdesigner/api/option
Update an existing option from its name

POST /mockdesigner/api/option/reset
Reset all options

### Project