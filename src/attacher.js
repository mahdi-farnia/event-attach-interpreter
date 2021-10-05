const { isPlainObject } = require('is-plain-object');
const Interpreter = require('./interpreter');
const EventEmitter = require('events');

class Attacher extends Interpreter {
  constructor(emitter) {
    super();
    this.paramStore = {};
    this._eventStore = {};
    this.emitter =
      emitter instanceof EventEmitter ? emitter : new EventEmitter();
  }

  params(obj) {
    if (!isPlainObject(obj)) return this;

    for (const propName in obj) this.paramStore[propName] = obj[propName];

    return this;
  }

  /**
   * @private
   * @param {string} prop
   */
  _has(prop) {
    return this.paramStore.hasOwnProperty(prop);
  }

  /**
   * @private
   * @param {string[]} props
   */
  _hasAll(props) {
    return props.every((prop) => this._has(prop));
  }

  hasParams(name) {
    if (arguments.length > 1) return this._hasAll([].slice.call(arguments));

    if (Array.isArray(name)) return this._hasAll(name);

    if (typeof name === 'function') return this._has(name.name);

    return this._has(name != null ? name.toString() : '');
  }

  parse(text, dataObj) {
    if (typeof text !== 'string') return this;

    const overWriteWith = isPlainObject(dataObj) ? dataObj : null;

    const data = Object.assign({}, this.paramStore, overWriteWith);
    const parsedObj = super.parse(text);
    this.exec(parsedObj, data);

    return this;
  }

  /**
   * @private
   */
  exec(parsedObj, data) {
    for (const action in parsedObj) {
      const actionArr = parsedObj[action];

      actionArr.forEach(({ events, parameters }) => {
        const params = parameters.map((p) => data[p]);

        if (action === 'emit') {
          return events.forEach((ev) => this.emitter[action](ev, ...params));
        }

        params.forEach((_param) => {
          let typeofParam;
          if ((typeofParam = typeof _param) !== 'function') {
            const key = parameters.find((key) => data[key] === _param);
            return this.nonFunctionWarn(action, events, key, typeofParam);
          }

          events.forEach((ev) => this.emitter[action](ev, _param));
        });
      });
    }
  }

  /**
   * @private
   */
  nonFunctionWarn(action, events, key, actualType) {
    console.warn(
      `WARN Event Attacher: Adding listener for method: '${action}' with events: '${events.join(
        ', '
      )}' with argument(s): '${key}' was skipped for preventing error. expect ${key} to be a 'function' but received '${actualType}'`
    );
  }
}

module.exports = Attacher;
