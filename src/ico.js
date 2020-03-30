const IconEntry = require('./iconentry')

class ICO {
    constructor() {
        this._iconEntries = []
        this._iconCount = 0
    }
    _initEntry(index) {
      this._iconEntries[index] = new IconEntry()
    }
}

module.exports = ICO