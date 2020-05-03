# Functions

To be able to return some dynamics responses, you can use some functions to generate random values, unique values ...

## Native functions

Mock designer system provide you some natives functions to generate values:
* UUID
* UniqueID
* Increment
* RandomInteger
* RandomString
* RandomDate
* UpperCase
* LowerCase

### UUID
This function will use the Universally Unique Identifier version 4 to generate unique hexadecimal value.
> **Usage**:
UUID()
*Inputs:* No inputs required
*Output:* Provide an hexadecimal unique value 

> **Example**:
```json
{
    "id": 1,
    "uniqueString": "{{ UUID() }}"
}
```
> **Result** :
```json
{
    "id": 1,
    "uniqueString": "63e12d09-4dbb-4bf9-aa21-b928d9f6c699"
}
```

### UniqueID
Based on the current datetime, this function provide you an integer based the current datetime. The benefict of this method is to have an integer value but the uniqueness of the value cannot be guaranteed, if you use some process worked in parallel.
The uniqueness of this value can be guaranteed uniquely if you don't have two processes executed at the same time.
> **Usage**:
UniqueID()
*Inputs*: No inputs required
*Output*: A integer unique value

> **Example**:
```json
{
    "id": 1,
    "uniqueValue": {{UniqueID()}}
}
```

> **Result**:
```json
{
    "id": 1,
    "uniqueValue": 20200503134601744
}
```

## Increment
In lot's of system, we need to have an increment value to have a different value after each call.
Mock designer propose an option to generate an increment.
> **Usage**:
Increment(key)
*Inputs*:
--- Key: A string parameter to store the increment value
*Output*: A increment integer value
> **Example**:
```json
{
    "id": 1,
    "name": {{ Increment(USER) }}
}
```
> **Result**:
```json
{
    "id": 1,
    "increment": 21
}
```

### Current date
In some system, we need to have current date in mock response, this option is possible with Mock Designer
> **Usage**:
CurrentDate()
*Inputs*: No inputs required
*Output*: A date formatted with the following format: 'YYYY-MM-DD hh:mm:ss'
> **Example**:
```json
{
    "id": 1,
    "currentDate": "{{CurrentDate()}}"
}
```
> **Result**:
```json
{
    "id": 1,
    "currentDate": "2020-05-03 13:46:01"
}
```

### Random integer
Random values can help developpers to test lot's of use cases. Mock designer provide an option to generate random integer
> **Usage**:
RandomInteger(maxValue)
*Inputs*:
--- maxValue: a integer parameter to indicate the max value
*Output*: An integer random value
> **Example**:
```json
{
    "id": 1,
    "randomInteger": "{{RandomInteger(100)}}"
}
```
> **Result**:
```json
{
    "id": 1,
    "randomInteger": "69"
}
```

### Random string
Random values can help developpers to test lot's of use cases. Mock designer provide an option to generate random string
> **Usage**:
RandomString()
*Inputs*: No inputs required 
*Output*: A random string value
> **Example**:
```json
{
    "id": 1,
    "randomString": "{{RandomString()}}"
}
```
> **Result**:
```json
{
    "id": 1,
    "randomString": "solid"
}
```

### UpperCase
Classic string uppercase function
> **Usage**:
UpperCase(content)
*Inputs*:
--- content: The content to proceed
*Output*: An uppercase string

> **Example**:
```json
{
    "id": 1,
    "upperCaseConstant": "{{UpperCase(test)}}",
    "upperCaseRequest": "{{UpperCase({{.request.body.username}})}}",
}
```

> **Result**:
```json
{
    "id": 1,
    "upperCaseConstant": "TEST",
    "upperCaseRequest": "TEST",
}
```

### LowerCase
Classic string lower case function
> **Usage**:
LowerCase(content)
*Inputs*:
--- content: The content to proceed
*Output*: A lowercase string

> **Example**:
```json
{
    "id": 1,
    "lowerCaseConstant": "{{LowerCase(Test)}}",
    "lowerCaseRequest": "{{LowerCase({{.request.body.username}})}}",
}
```

> **Result**:
```json
{
    "id": 1,
    "lowerCaseConstant": "test",
    "lowerCaseRequest": "test",
}
```


## Complexe usage 

Mock designer allow you to call functions on expression. The expression will be evaluated first and after the function will be applied on the result of the evaluation

**Example**:
```json
{
    "id": 1,
    "upperCaseConstant": "{{UpperCase(test)}}",
    "upperCaseRequest": "{{UpperCase({{.request.body.username}})}}",
}
```

## Extends functions

## Next features

- [ ] Add the possibility to parameter the expire value for increment function
- [ ] Add the possibility to inject integer functions in JSON body file and repect JSON format
- [ ] Add a format parameter to generate current date in specific format
- [ ] Add a random date function to generate random date