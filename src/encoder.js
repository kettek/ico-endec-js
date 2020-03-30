const ICO = require('./ico')

/**
 * icoEndec.
 */
class Encoder extends ICO {
    constructor(data) {
        super()
        this._buffer = null
    }
}

module.exports = Encoder