# Mock Designer
To use easily Mock Designer, you must know some basic notions.

## Organization
There are some rules to organize your project, you can manage all mock services of your application / domain in the same project.
You can create one big with lot's of services or you can organize your services in several files.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/organization.md)

## Actions
Mock designer can manage several actions on the reception of a request. You can just send a response or apply more complex actions like save data ...
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/action.md)

## Response
On the reception of a request, the mock service will answer response. You can send static responses based on text or file or send dynamic content. You can use functions, data stored, data sources, request data...
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/response.md)

## Trigger
You can add some conditions in your actions to add more dynamism in your service.
You can based your conditions on data, request, expression..
You can use some rotation mechanism: sequential, random
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/trigger.md)

## Behaviour
To manage mock technical error, Mock Designer propose a new system name behaviour. You can setup a behaviour to define how the mock will answer. With this system you can change dynamically the mock response.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/behaviour.md)

## Authentication
To simulate authentication system, Mock Designer propose a solution that simulate the main authentication system: basic ...
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/authentication.md)

# Protocol
Https, websocket...
Proxy
TODO

## Extends the system
TODO