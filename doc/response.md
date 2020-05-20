# Message action
On the reception of a request, the mock service will answer response. Service can send static responses based on text or file or send dynamic content. There are some tools available to add dynamic response: functions, data stored, data sources, request data...

## Usage
This action send a response in reaction of a request received. This action can be configure with the following properties:
* type: A mandatory string property. This property must be equals to message for this action.
* status: An optionnal number property. This property represents the HTTP status code to return. By default, the value of this property is 200.
* headers: An optionnal dictionnary property. This dictionnary represents the HTTP headers to return.
* body: An optionnal string property. This property represents the body to return.
* bodyFile: An optionnal string property. This property represents the path to the file to send as body.

Example:
```yml
actions:
- type: message
  status: 200
  headers:
    Content-Type: application/json
  bodyFile: ../responses/examples/data.json
```

## Tools
Tools propose help to add some dynamism in your response. These tools can be used with lot's of action or trigger but often used with the message action, so the documentation linked to these tools is present in message action section.

### Functions 
A tool propose to add some dynamism in a response: functions.
Function generate can generate unique values, current date, random values ...
Mock Designer have an option to generate your custom functions.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/function.md)

### Storage
A tool propose to add some dynamism in a response: storage.
Storage system help to send coherent data in a response.
Mock Designer propose an action to save data in a storage, the storage option allow to reuse the data previously stored.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/storage.md)

## Data sources
A tool propose to add some dynamism in a response: data source.
Data source propose a solution to manage simple and structured data set.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/datasource.md)

## Request
A tool propose to add some dynamism in a response: request.
Request solution propose a way to reuse the data from the request (path, query, headers, body).
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/request.md)

## Context
A tool propose to add some dynamism in a response: response.
Foreach request proceed, a context instanciated and response can reuse data computed during this processing step.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/context.md)