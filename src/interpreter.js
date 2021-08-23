class Interpreter {
  /**
   * @private
   */
  init(text) {
    this.text = text;
    this.len = text.length;
    this.word = '';
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
    const { Terminators: terminators } = Interpreter.Expectations,
      char = this.getCurrentChar(),
      stringEnded = this.len === this.nextCharIndex - 1;

    if (
      (stringEnded || terminators.indexOf(char) > -1) &&
      !Interpreter.isEmptyString(this.word)
    ) {
      this.readWords();

      if (stringEnded) return this.saveStoredData();

      switch (char) {
        case ':':
          this.storeAsEvent = false;
          break;
        case ';':
          this.saveStoredData();
          this.resetAction();
          break;
      }

      return this.readText();
    }

    // Added if block for two or more terminators
    if (!Interpreter.isEmptyString(char)) this.word += char;
    this.readText();
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
  readWords() {
    const isValid = this.expectKeywordType.some(
      (t) => t === 'any' || t === this.word.toLowerCase()
    );

    if (!isValid) return this.syntaxError();

    const { AnyType, ActionTypes } = Interpreter.Expectations;

    this.expectKeywordType === ActionTypes ? this.grabAction() : this.store();
    this.expectKeywordType = AnyType;
    this.word = '';
  }

  /**
   * @private
   */
  syntaxError() {
    throw new Error(
      `Interpreter Error: Expect '${this.expectKeywordType.join(
        "' or '"
      )}' but found '${this.word}'`
    );
  }

  /**
   * @private
   */
  grabAction() {
    const lowerCased = this.word.toLowerCase();
    this.actionType = lowerCased;

    if (!Array.isArray(this.parseObj[lowerCased]))
      this.parseObj[lowerCased] = [];
  }

  /**
   * @private
   */
  store() {
    this.storeAsEvent
      ? this.events.push(this.word)
      : this.parameters.push(this.word);
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
