# Organization
In Mock Designer, the test organization is an important rule to follow in order to add your own custom files or organize your tests with directory.

## Project Structure
Mock designer propose you the following organization, include all your code in tests directory.
Inside this tests directory:
* data directory: Add data sources in this directory (json, ~~xml~~, ~~csv~~)
* functions directory: Add custom functions in this directory (ts)
* response directory: Add service response in this directory (json, txt, xml)
* code directory: Add service code in this directory (yml)

Inside each these directories, you can add subdirectories to organize your different services.

## Code structure

A mock is a system defined on a specific, this system contains one or several services.
A service listen on a path, a method and a soap action (for SOAP service).

* Rest service
```yml
- name: GetAllCommands
  method: GET
  path: /api/v1/command
```  

* SOAP service
```yml
- name: soapCreateService
  soapAction: create
  path: /api/v1/command
```

A service match a specific structure:

```yml
  - name: behaviourService
    method: POST
    path: /api/v1/behaviourService
    response:
      behaviours:
      - name: ERROR_500
        ...
      triggers:
      - type: none
        actions:
        ...
```

* Behaviour: Behaviour executed in first. Behaviour allow to execute alternative use cases.
* Trigger: Trigger executed in second.
Trigger allow to execute conditionnal use cases.

## Include

Mock Designer propose an include statement.
This statement can be used to divide big file in small files or can be used to facilitate some reuse.

An example of include statement:
```yml
name: MyMock
services:
  ##INCLUDE include.yml.part1##
##INCLUDE include.yml.part2##
```

## Next feature

- [x] Avoid the folder restriction 
- [ ] Add statement to include code in service