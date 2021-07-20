## Trigger

By default when you create a mock, you configure the response to not use triggers by default.
Below the first example:
```yaml
name: myFirstProject
services:
  - name: myFirstService
    method: GET
    path: /api/v1/myService

```

The next mock description is the same than the previous one:
```yaml
name: myFirstProject
services:
  - name: myFirstService
    method: GET
    path: /api/v1/myService
    response:
      triggers:
      - type: none
        actions:
        - type: message
            status: 200
            body: OK
```

In this example, we can see a new keyword triggers, you can add many triggers but take care of this order.
Add the default no triggers at the end of the trigger list to have a default response. 
Now, we will see what kind of trigger, we can use ...

### Data trigger

Data trigger allow you to change the mock response according to request data.

Example:
```yaml
name: dataTrigger
services:
- name: dataTriggerService
  method: POST
  path: /api/v1/dataTrigger/:id
  response:
    triggers:
    - type: data
      conditions:
      - leftOperand: "{{.request.params.id}}"
        operation: EQUALS
        rightOperand: "99999"
      - leftOperand: "{{.request.body.name}}"
        operation: EQUALS
        rightOperand: "ERROR_500"
      actions:
      - type: message
        status: 500
        body: "Internal error"
    - type: data
      conditions:
      - leftOperand: "{{.request.params.id}}"
        operation: EQUALS
        rightOperand: "99999"
      - leftOperand: "{{.request.body.name}}"
        operation: EQUALS
        rightOperand: "ERROR_400"
      actions:
      - type: message
        status: 400
        body: "Invalid request"
    - type: data
      conditions:
      - leftOperand: "{{.request.params.id}}"
        operation: MATCHES
        rightOperand: "coucou[a-z]*"
      actions:
      - type: message
        status: 200
        body: "Coucou"
    - type: data
      conditions:
      - leftOperand: "{{.request.params.id}}"
        operation: IN
        rightOperand: "1000;1001;1005"
      actions:
      - type: message
        status: 200
        body: "Ohhh good id ..."
    - type: data
      conditions:
      - leftOperand: "{{.request.params.id}}"
        operation: RANGE
        rightOperand: "2000...2021"
      actions:
      - type: message
        status: 200
        body: "Ahh ok, it's works too"
    - type: none
      actions:
      - type: message
        status: 200
        body: OK
```
In this example, according to request params id, you can change the mock response.
You can have one condition or several conditions to enable or not a response. If you have several conditions, all conditions must be evaluated to true to send the response.

A condition is:
* a left operand: Use an [expression](./expression.md).
* an operation: An operation to apply between the left and the right operands.
* a right operand: Depends of the operation choose, check section below.

Operand         | Right operand
--------------- | ------------------------------------------------------
EQUALS          | A constant or expression, the type will be ignored during the comparaison
NOT_EQUALS      | A constant or expression, the type will be ignored during the comparaison
MATCHES         | A regex
NOT_MATCHES     | A regex
IN              | A list of value separed by a semi colon
NOT_IN          | A list of value separed by a semi colon
RANGE           | Two values separed by three points

### Sequential trigger

Sequential trigger allow you to change the mock response regular

Example:
```yaml
name: sequentialMock
services:
  - name: sequentialService
    method: POST
    path: /api/v1/sequentialService
    response:
      triggers:
      - type: sequential
        messages:
        - repeat:  3
          actions:
          - type: message
            status: 200
            body: Operation completed successfully
        - repeat: 2
          actions:
          - type: message
            status: 400
            body: Request sent invalid
        - repeat:  1
          actions:
          - type: message
            status: 500
            body: An internal error occured
```

### Random trigger

Data trigger allow you to change the mock response according to request data.

Example:
```yaml
name: randomMock
services:
  - name: randomService
    method: POST
    path: /api/v1/randomService
    response:
      triggers:
      - type: random
        messages:
        - probability:  85
          actions:
          - type: message
            status: 200
            body: Operation completed successfully
        - probability: 10
          actions:
          - type: message
            status: 400
            body: Request sent invalid
        - probability:  5
          actions:
          - type: message
            status: 500
            body: An internal error occured
```