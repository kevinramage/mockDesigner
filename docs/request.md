## Expression - Request

Property    | usage                 | comment 
----------- | --------------------- | ----------------------
path        | path of request sent  | path include query and params. Path not include protocol, server and port
protocol    | protocol of request sent | http or https
method      | method of request sent | GET, POST, PUT, DELETE ...
query       | query of request sent | see query section below
params      | params of request sent | see params section below
headers     | headers of request sent | see headers section below
body        | body of request sent | see body section below

### Query

Use query propery to collect informations about a specific query parameter.
Return value is always a string (Note: If you want have an integer value, use function).

Example:
Request: http://localhost:7001/example/01/myService2?queryTry=test&queryTest=2
Use this expression for first parameter: .request.query.queryTry
Use this expression for second parameter: .request.query.queryTest

### Params

Use params propery to collect informations about a specific parameter.
Parameter must be declared in service path (with the syntax :id)
Return value is always a string (Note: If you want have an integer value, use function).

Example:
Service path: http://localhost:7001/example/01/offerGroup/:grpId/offerId/:offId
Request: http://localhost:7001/example/01/offerGroup/2/offerId/1
Use this expression for first parameter: .request.params.grpId
Use this expression for second parameter: .request.params.offId

### Headers

Use headers property to collect informations about a specific header
Example:
`{{ .request.headers.content-type }}

Header name must be specify in lower case.
Return value is always a string except for specifics headers:
* age
* content-length
* dnt
* downlink

Array exception:
If you sent several times the same header name, the header value will contains all values sent in a single string with the following format "value1, value2".
Except for set-cookie header, this header return an array.

### Body

Use body property to collect informations about a body element.
This property work only with JSON and XML content.
This property work only with simple value (string or number), all elements are case sensitive.

Array:
If you want to access to array element, use the index of the element (Example: .request.body.myElement.0).

XML:
To access to text element, use the '_' element (Example: .request.body.root.test.0._).
To access to attribute element, use the '$' element (Example: .request.body.root.test.0.$.myAtt)