import type { EventEmitter } from 'events';

interface PlainObject {
  [key: string]: any;
}

declare class Attacher {
  /**
   * @param emitter if empty, one will create
   */
  constructor(emitter?: EventEmitter);
  emitter: EventEmitter;
  paramStore: PlainObject;
  hasParams(name: string): boolean;
  hasParams(...names: string[]): boolean;
  hasParams(names: string[]): boolean;
  hasParams(fn: Function): boolean;
  /**
   * @param params
   * Parameters to store in object and use for each parse process
   *
   * Parameters can be overwritten by **dataObj** parameter in parse method
   */
  params(params: PlainObject): this;
  /**
   * @param text
   * String to parse
   * @example
   * // EventEmitter imported from events built-in node module
   * const emitter = new EventEmitter();
   * const attacher = new Attacher();
   *
   * // Parse method text param scheme should be like this:
   * // "actionType eventNames: parameters"
   * //
   * // actionType can be "emit" or "on" or "once" or "off" and it's **not case sensitive**
   * //
   * // eventNames can be anything and can be mutiple things at once: "once click, mouseover, mouseup: handler"
   * //
   * // parameters are placeholder of dataObject properties and can be mutiple things at once:
   * // "on click: listener1 listener2 listener3"
   * //
   * // You can seperate between actionType or each event or parameters with space or comma (,) or both (, ) or new line
   * // extra comma or whitespace will be ignored
   *
   * // NOTE: actionTypes except 'emit' should use function parameters because they are event listeners ( too obvious )
   *
   * attacher
   *   .handlers({ logInfo(name, age) { console.log(`Hello, I'm ${name} and i am ${age} years old!`) } })
   *   .parse("Once greet: logInfo");
   *
   * attacher.parse("emit greet: name1, age1", { name1: "john", age1: 20 });
   * // Hello I'm john and i am 20 years old!
   *
   * // Mutiple events and parameters
   * attacher.parse("ON before-exit exit SIGINT: exitProcess, closeServer", {
   *    exitProcess() {
   *      process.exit(0);
   *    },
   *    closeServer() {
   *      server.close();
   *    }
   * });
   *
   * // Multiple actionTypes with different params
   * //
   * // You can seperate each part by inserting semicolon (;)
   * attacher.parse("on click: clickHandler; emit click: Event", { Event: {  }, clickHandler(e) {} })
   * @param dataObj
   * Parameter to overwrite stored parameters
   *
   * Given object will not store
   */
  parse(text: string, dataObj?: PlainObject): this;
}

export = Attacher;
