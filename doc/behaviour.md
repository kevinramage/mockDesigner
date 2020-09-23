# Behaviour

Mock designer propose solution to add some dynamism in our service response.
You can add some custom behaviour in your service essentially to test your error management or an specific / alternative behaviour.
To manage the error handling, you have sereral solutions:
* Data: Throw a error response when you received a specific data from the request
Developpers just have to use specific data set to throw an error
* Path: Create a path dedicated to error response
Developpers just have to change the service endpoint to throw an error

These two solutions are available with Mock Designer, you can use it easily if you want.
But these two solutions have some issues:
* Specific: Data solution is very specific, it can complex to generalize the same behaviour in all your mocks, can be complex to share the mock behaviour with our teams.
* Not always applicable: Data solution work fine for POST, PUT request, it can be more complex for GET request. (Except if you use request header)


Mock Designer propose you a new solution named behaviour system.
You can setup / plan the mock response with the creation of a behaviour. The behaviour will define the mock behaviour for the next call.
In specific situation, you need to break down the service not for the next call but in certain conditions. You can create a behaviour to define this condition and use it in the service. 

## Definition

For each service, Mock Designer create automatically a path dedicated to the behaviour management.
You can get, create, update, delete behaviour for your service. An API is available to manage theses operations /api/v1/:serviceName/_behaviour.
Mock designer propose an option to define behaviours for your service.

> By default, a behaviour expired after 10 hour. You can change the expiration delay with the expired property in mock creation.

## Usage

**Definition**

To create a behaviour definition, you can 
* name: The name of the behaviour.
* repeat: The number of times, the behaviour will be applied, optionnal value. 
The special value -1 is used to apply to infinity the behaviour.
The default value of this attribute is -1.
* conditions: Conditions to match to apply the behaviour
* actions: Actions to proceed

> You can create several behaviours for a same service. The behaviour name must be unique for a dedicated service

**Instance**

> Get all behaviour instance
Execute GET request with the path "/api/v1/:serviceName/_behaviour"

> Get behaviour instance
Execute GET request with the path "/api/v1/:serviceName/_behaviour/:behaviourName"

> Create behaviour instance
Execute POST request with the path "/api/v1/:serviceName/_behaviour"
The request body must contains the behaviour name.

> Delete behaviour instance
Execute DELETE request with the path "/api/v1/:serviceName/_behaviour/:behaviourName"

> Delete all behaviour instances
Execute DELETE request with the path "/api/v1/:serviceName/_behaviour"

## Example

Declaration of a behaviour with specifics conditions:
* 2 conditions must match to be:
The body name must be equals to MyName
The body description must be equals to myDescription
* Repeat statement enabled: The behaviour will be apply for the next 3 call after the behaviour will be automatically removed

```yaml
response:
    behaviours:
    - name: ERROR_500
      repeat: 3
      conditions:
      - "'{{.request.body.name}}' == 'MyName'"
      - "'{{.request.body.description}}' == 'myDescription'"
      actions:
      - type: message
        status: 500
        body: An internal error occured
```