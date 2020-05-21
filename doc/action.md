# Action
Mock Designer propose actions to react to different requests. 
With Mock Designer actions, a mock can send a response, save request data.

## Message action
This action provide a way to send a response from a text or a file.
This action provide the possibility to send custom status, headers, body.
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/message.md)

## Validate the request
**Functionnality not available now**
This action provide a way to check the request validity before the response processing.
Validation action propose several checks:
* The presence of mandatory fields
* The consistency of fields
* The array length validity
[More informations]()

## Save data
This action provide a way to save the request received.
The save action will store the request in specific storage space with a unique key. 
The save action provide a possibility to customize data stored and organize data in dedicated property. The save action can save simple property or complex / structured property.
Data stored with this process will expired after 10 hours (This expiration can be configured).
[More informations](https://github.com/kevinramage/mockDesigner/blob/master/doc/storage.md)

## Compute context
**Functionnality not available now**
[More informations]()