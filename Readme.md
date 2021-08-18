# Event Attach Interpreter
Control events with template strings

## Install
```npm i event-attach-interpreter```

## Nodejs Support
Requires Nodejs v6+ to run

## Api
```ts
class Attacher {
    // if no emitter passed, one will create
    constructor(emitter?: EventEmitter); // Nodejs EventEmitter

    // Object to store and fill placeholders with
    params(params: PlainObject): this;

    hasParams(name: string): boolean;
    hasParams(names: string[]): boolean;
    hasParams(...names: string[]): boolean;
    hasParams(fn: Function): boolean; // For function properties

    /**
     * Fires interpreter and executes parsed object
     * @param dataObj overwrites stored params
     */
    parse(text: string, dataObj?: PlainObject): this;
}
```

## Simple Usage
```js
const attacher = new Attacher();

attacher
    .params({ greet() { console.log("Hello, I'm John!") } })
    .parse("on greet: greet")
    .parse("emit greet");
// or
// attacher.parse("emit greet");

// Hello I'm John!
```
## Template String Schema
Template strings have 3 parts:
- action type: 'on' or 'once' or 'off' or 'emit' ( not case sensitive, can be upper case or lower case or combination of both )
- events: can be anything
- parameters: keys of data object ( Parameters are placeholders of params object properties & methods )

> actionType ...events: ...parameters;

Each part ( *Except Events And Parameters* ) can be seperated with comma (,) or white space or new line.

The last semicolon is required *when you wanna have multiple segments like this*:
```js
attacher.parse("ONCE click mouseup: log; Off click, mouseup: log")
```
*The semicolon at the end of string is not required.*

## Complete Example
```js
//
// Use arguments
//
attacher
    .params({ sayHello(name, lastname) { console.log(`Hello ${name}`) } })
    .parse("ON hello: sayHello; emit hello: name1 lastname1", { name1: "John", lastname1: "Doe" });

//
// Aceess & Manage Events Manually ( Without Parser )
//
attacher.parse("ON server-listen: serverListener", { serverListener(port) {
    console.log("server is listening on port " + port)
}});

attacher.emitter.eventNames()
// > ['server-listen']

attacher.emitter.emit("server-listen", 3000);
// > server is listening on port 3000

attacher.emitter.off("hello", attacher.paramStore.sayHello);

attacher.emitter.eventNames()
// > []

// Emit with no argument
attacher.parse("ON click: click; emit click", { click() {} });
// or attacher.parse("emit click");
```

## License
This Package Is Under MIT Liscense.

LICENSE file can be found in root directory.