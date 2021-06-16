
/** Taken from "The Definitive ANTLR 4 Reference" by Terence Parr */

// Derived from http://json.org
grammar JSON;

json
   : value
   ;

obj
   : '{' pair1=pair (',' pairRemaining+=pair)* '}'
   | '{' '}'
   ;

pair
   : key=STRING ':' pairValue=value
   ;

arr
   : '[' value1=value (',' valueRemaining+=value)* ']'
   | '[' ']'
   ;

expression
   : OPEN_EXP DOT 'data' DOT idData1=IDENT (DOT idDataRemaining+=IDENT)* CLOSE_EXP
   | OPEN_EXP DOT id1=IDENT (DOT idRemaining+=IDENT)* CLOSE_EXP
   ;

value
   : string=STRING
   | number=NUMBER
   | exp=expression
   | object=obj
   | array=arr
   | true='true'
   | false='false'
   | null='null'
   ;

DOT: '.';
OPEN_EXP: '{{';
CLOSE_EXP: '}}';

NUMBER: '-'? INT ('.' [0-9] +)? EXP?;
fragment INT: '0' | [1-9] [0-9]*;
fragment EXP: [Ee] [+\-]? INT ;

IDENT: ID (ID | '-' | '_')*;
STRING: '"' (ESC | SAFECODEPOINT)* '"';

fragment ESC: '\\' (["\\/bfnrt] | UNICODE);
fragment UNICODE: 'u' HEX HEX HEX HEX;
fragment HEX: [0-9a-fA-F];
fragment ID: [0-9a-zA-Z];
fragment SAFECODEPOINT: ~ ["\\\u0000-\u001F];

WS
   : [ \t\n\r] + -> skip
   ;