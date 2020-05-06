# Request
A mock return often dummy values to test your applications. In some case, you need to use the request value in the response.
The Mock Designer support XML and JSON requests.

## Request query
You can reuse request query values in your mock response.

**Syntax**
.request.query

**Example**:
```json
{
    "id": 1,
    "searchQuery": "{{.request.query.search}}",
    "strictQuery": "{{.request.query.strict}}"
}
```

## Request parameters
You can reuse request parameter values in your mock response.

**Syntax**
.request.params

**Example**:
```json
{
    "id": 1,
    "idParam": "{{.request.params.id}}",
    "subIdParam": "{{.request.params.subId}}"
}
```

## Request headers
You can reuse the request header values in your mock response.
*Warning*: The header name must be in lower case

**Syntax**
.request.headers

**Example**:
```json
{
    "id": 1,
    "contentTypeHeader": "{{.request.headers.content-type}}"
}
```

## Request body
You can reuse the request body values in your mock response.

**Syntax**
.request.body
.request.soapHeaders (For SOAP request only) : Get the soap headers of SOAP request
.request.bodyBody (For SOAP request only) : Get the soap body of SOAP request
.request.bodyBody.$.attValue (For SOAP request only) Get node attribute of XML node

**Example**:
```json
{
    "id": 1,
    "userName": "{{.request.body.userName}}}",
    "password": "{{.request.body.password}}"
}
```

> For XML request attrbute, you can use the following syntax ($):
```xml
{
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Header/>
   <soapenv:Body>
      <id>1</id>
	  <userName>{{.request.body.soapenv:Envelope.soapenv:Body.doc:Account.username}}</userName>
	  <userNameAtt>{{.request.body.soapenv:Envelope.soapenv:Body.doc:Account.username.$.att}}</userNameAtt>
   </soapenv:Body>
</soapenv:Envelope>
}
```

> For XML request you can use the shortcut *soapHeaders* 
```xml
{
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Header/>
   <soapenv:Body>
      <id>1</id>
	  <header>{{.request.body.soapenv:Envelope.soapenv:Header.doc:MyHeader}}</header>
      <secondHeader>{{.request.soapHeaders.doc:SecondHeader}}</secondHeader>
   </soapenv:Body>
</soapenv:Envelope>
}
```

> For XML request, you can use the shortcut *soapBody*
```xml
{
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Header/>
   <soapenv:Body>
      <id>1</id>
	  <userName>{{.request.body.soapenv:Envelope.soapenv:Body.doc:Account.username}}</userName>
	  <password>{{.request.soapBody.doc:Account.password}}</password>
   </soapenv:Body>
</soapenv:Envelope>
}
```

## Next features

- [ ] Support the url encoded format
- [ ] Support the usage of object directly in the body response