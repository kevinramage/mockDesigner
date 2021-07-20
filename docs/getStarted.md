## Prerequisite

MockDesigner works with nodeJS or docker.

### NodeJS 
Install nodeJS from [official repository](https://nodejs.org/en/download/)

### Docker
Install docker from [official repository](https://docs.docker.com/get-docker/)

## Install MockDesigner

### First clone GIT repository
Use the following command line to clone the repository
`git clone https://github.com/kevinramage/mockDesigner.git`

### Run MockDesigner

Go to src directory
With npm, use the following statement:
`npm install`
`npm install -g typescript`
`npm start`

With docker, use the following statement:
`docker-compose up` 

## Configure your first mock

Go to mock directory (src/mock)
Create a directory for your project (for example: myFirstProject)
Under this new directory, create a new 'code' directory
Under this new directory, create a new 'main.yml' file
Now, you must have this working tree:
| src
|_ mock
|__ myFirstProject
|___ code
|____ main.yml

Complete the 'main.yml' file with the following yaml code:
```yaml
name: myFirstProject
services:
  - name: myFirstService
    method: GET
    path: /api/v1/myService
    response:
      actions:
      - type: message
        status: 200
        body: OK
```
With this code, you will create a new service named 'myFirstService'.
This service will provide to the user an HTTP response 200 with the body 'OK' when someone query the 'http://localhost:7001/api/v1/myService' with the GET method.

Note: You can change the default listening port in options.json file.

## Configure complexes responses

Mock designer propose a way to manage complexe or large response.
It's possible to store request to send in external file:

Go back to your mock directory (src/mock/myFirstProject)
Under this directory, create 'responses' directory
Under this new directory, create a 'response.jsonx' file

Complete the 'response.jsonx' file with the following yaml code:
```json
{
    "status": "COMPLETED",
    "userId": 1234,
    "channelId": {{ .request.headers.channelId }},
    "channelName": "{{ .request.headers.channelName }}"
}
```

This JSON reponse is template with two expressions:
* A first expression to get integer 'channel id' from request headers
* A second expression to get string 'channel name' from request headers

Now, add a new service:
Add following code to main.yml (src/mock/myFirstProject/code/main.yml):

```yaml
...
  - name: mySecondService
    method: GET
    path: /api/v1/myService2
    response:
      actions:
      - type: message
        status: 200
        bodyFile: response.jsonx
```

Note: By default, Mock designer detect body file extension and if the extension is 'jsonx', Mock Designer will interpret body file as template file
Note: By default, Mock designer detect content type sent and assign content type header if your forget it

Next step: [Understand mock description](./mockDescription.md)