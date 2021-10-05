const Attacher = require('../');
const EventEmitter = require('events');
const { strictEqual } = require('assert/strict');

const emitter = new EventEmitter();

// Test Arguments
const testListeners = (name, age) => {
  strictEqual(
    name,
    'màsood khoshtinat',
    `Expect name parameter to be 'màsood khoshtinat' but found '${name}'`
  );

  strictEqual(age, 54, `Expect age parameter to be 54 but found ${age}`);
};

const store = {
  logInfo: testListeners,
  getFeeling: testListeners,
  name: 'màsood khoshtinat',
  age: 54
};
const attacher = new Attacher(emitter).params(store);

// Must warn for log method which is undefined
attacher.parse('on echo: log', { log: undefined });

// Test stored parameters
strictEqual(
  attacher.hasParams(Object.keys(store)),
  true,
  'Expect to have age property in stored parameters'
);

attacher
  .parse(`ONCE greet: logInfo getFeeling; emit greet: name age`)
  .parse(
    'ON event1 event2: event1Listener; off event1, event2: event1Listener',
    {
      event1Listener() {}
    }
  );

// Test once and off
strictEqual(
  emitter.eventNames().length,
  0,
  `Expect no event but found ${emitter.eventNames().length}`
);

attacher.parse(
  `once
        before-exit
        exit: exitProcess`,
  {
    exitProcess() {
      console.log(`✅ Test Passed Successfuly`);
      process.exit(0);
    }
  }
);

// Test 'before-exit' and 'exit' to be available
strictEqual(
  attacher.emitter.eventNames().length,
  2,
  `Event count is invalid, expected 2 found ${
    attacher.emitter.eventNames().length
  }`
);

attacher.parse('emit exit');

// Test emitted event 'exit'
throw new Error('Expect to exit process with emitted event');
