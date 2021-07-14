## Generation functions

Name                    | Description
----------------------- | ------------------------------------------------------------
Integer                 | Generate a random integer positive value between 0 and max (provided as function argument)
Float                   | Generate a random float positive value between 0 and max (provided as function argument)
Hexa                    | Generate a random hexadecimal number as a string. The length of the number can be specify.
String                  | Generate a random word
FirstName               | Generate a random first name
LastName                | Generate a random last name
Mail                    | Generate a random mail
FileName                | Generate a random fileName
PhoneNumber_FR          | Generate a random phone number FR format
PhoneNumber_US          | Generate a random phone number US format
PhoneNumber_UK          | Generate a random phone number UK format
IPV4                    | Generate a random IP V4
IPV6                    | Generate a random IP V6
MacAddress              | Generate a random mac address
MD5                     | Generate a random MD5 hash
SHA1                    | Generate a random SHA1 hash
SHA256                  | Generate a random SHA256 hash
UUIDV1                  | Generate a random UUID V1
UUIDV4                  | Generate a random UUID V4

### Integer

This function have one argument "max". By default max value is 10.
Examples:
{{ Generation.Integer(100) }}
{{ Generation.Integer() }}

### Float

This function have one argument "max". By default max value is 10.
Examples:
{{ Generation.Integer(10) }}
{{ Generation.Integer() }}

### PhoneNumber_FR

This function have one argument "format". By default the format is "dd-dd-dd-dd-dd".
Examples:
{{ Generation.PhoneNumber_FR() }}

### PhoneNumber_US

This function have one argument "format". By default the format is "ddd-ddd-dddd".
Examples:
{{ Generation.PhoneNumber_US() }}

### PhoneNumber_UK

This function have one argument "format". By default the format is "ddddd-dddddd".
Examples:
{{ Generation.PhoneNumber_UK() }}