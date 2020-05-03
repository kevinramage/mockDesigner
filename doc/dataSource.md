# Data source

To be able to test correctly your application, you need some mocks with some a large variety of data.
Mock Designer help you to use data source to populate your response body.

## Simple data source
You can use simple data source to have a large variety of test data. It can help you to manage your non regression tests. You can use this kind of data source to have a random string value.
By default Mock Designer provide theses data sources:
* firstname: Provide a random first name
* lastname: Provide a random last name
* cityname: Provide a city name
* postalcode_fr: Provide a FR postal code

**data.json**
```
{
    "id": 1,
    "username": "test",
    "password": "****",
    "fisrtName": "{{.data.firstname}}",
    "lastName": "{{.data.lastname}}"
}
```

## Structured data source
In some case, you must have a coherence with the data returned by the mock.
Mock designer provide you a way to do it, you can use a complex data source.
A complex data source is a data composed with several simple values, you can use the simples values of the complex data on your response.
When you want to use a datasource, the system will select a random datasource and provide the simple values linked.
By default Mock Designer provide theses data sources:
* city_fr: Provide a list of french cities

**data.json**
```
{
    "id": 1,
    "username": "test",
    "password": "****",
    "city": {
        "postalCode": "{{.data.city_fr.codePostal}}",
        "name": "{{.data.city_fr.nomCommune}}"
    }
}
```

## Extends data source

You can add your own data source, you just have to add your JSON in tests/data directory.
Your file will be automatically read and parse.
Actually the system support only JSON files
To have perfomance issue, don't too heavy file.

## Next features

* Support CSV format for datasource
* Support XML format for datasource