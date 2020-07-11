# Use cases
Some situations are complex to manage with classical mock system.
This article presents some use cases and the Mock Designer solution.

## Basic service with request informations
We want to simulate a simple service, this service send an hello word message with the username parameter sent from the request.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/usecase/basic.md)

## Login service with conditionnal response
We want to simulate a login service, this service authenticate the user from a username and a password sent in request body. 
To simulate authentication failed, we will use the username "userAuthFailed", if we received this username, mock system must send an 403 authentication failed.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/usecase/login.md)

## Retrieve an offer from the catalog
We want a service to retrieve an offer from a catalog. For testing purpose, we don't need to have a specific offer, we want have random offer to test with random values.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/usecase/catalog.md)

## Search client service with wiki page to describe data set
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
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/usecase/client.md))

## Command micro service services from swagger

## Export service with different error scenarios

## Manage SOAP Protocol with document upload

## Access to secure service OAuth2 authentication system 