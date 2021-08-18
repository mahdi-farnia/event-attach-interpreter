class Interpreter {
  /**
   * @private
   */
  init(text) {
    this.text = text;
    this.nextCharIndex = 0;
    this.parseObj = {};
    this.resetAction();
  }

  /**
   * @private
   */
  resetAction() {
    this.expectKeywordType = Interpreter.Expectations.ActionTypes;
    this.actionType = null;
    this.parameters = [];
    this.events = [];
    this.storeAsEvent = true; // Store As Event Or Parameter
  }

  /**
   * @private
   */
  readText() {
    let len = this.text.length,
      word = '';
    const { Terminators: terminators } = Interpreter.Expectations;

    while (1) {
      const char = this.getCurrentChar(),
        stringEnded = len === this.nextCharIndex - 1;

      if (
        (stringEnded || terminators.some((t) => t === char)) &&
        !Interpreter.isEmptyString(word)
      ) {
        this.readWords(word);

        if (stringEnded) return this.saveStoredData();

        word = '';

        if (char === ':') this.storeAsEvent = false;
        if (char === ';') {
          this.saveStoredData();
          this.resetAction();
        }
        continue;
      }

      // Added if block for two or more terminators
      if (!Interpreter.isEmptyString(char)) word += char;
    }
  }

  /**
   * @private
   */
  getCurrentChar() {
    return this.text[this.nextCharIndex++];
  }

  /**
   * @private
   */
  readWords(word) {
    const lowerCased = word.toLowerCase(),
      isValid = this.expectKeywordType.some(
        (t) => t === 'any' || t === lowerCased
      );

    if (!isValid) {
      throw new Error(
        `Interpreter Error: Expect '${this.expectKeywordType.join(
          "' or '"
        )}' but found '${word}'`
      );
    }
    const { AnyType: AnyType, ActionTypes } = Interpreter.Expectations;

    if (this.expectKeywordType === ActionTypes) {
      this.actionType = lowerCased;

      if (!Array.isArray(this.parseObj[lowerCased]))
        this.parseObj[lowerCased] = [];
    } else this.store(word);

    this.expectKeywordType = AnyType;
  }

  /**
   * @private
   */
  store(word) {
    this.storeAsEvent ? this.events.push(word) : this.parameters.push(word);
  }

  /**
   * @private
   */
  saveStoredData() {
    const actionArray = this.parseObj[this.actionType];

    actionArray.push({
      parameters: this.parameters,
      events: this.events
    });
  }

  /**
   * Initing Class & Calling Reader
   * @param {string} text
   * @returns {{ [key: string]: { handler: Function; actionType: "on" | "once" | "off" }[] }}
   */
  parse(text) {
    this.init(text);
    this.readText();
    return this.parseObj;
  }

  /**
   * @private
   */
  static Expectations = {
    ActionTypes: ['on', 'once', 'off', 'emit'],
    AnyType: ['any'],
    Terminators: [' ', ',', ':', ';', '\n']
  };

  /**
   * @private
   */
  static isEmptyString(arg) {
    const str = (arg != null ? arg : '').trim();
    return str === '' || this.Expectations.Terminators.some((t) => t === str);
  }
}

module.exports = Interpreter;
