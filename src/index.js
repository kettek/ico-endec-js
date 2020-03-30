const Encoder = require('./encoder')
const Decoder = require('./decoder')

module.exports = {
  Encoder: Encoder,
  Decoder: Decoder,
  decode: (buffer) => {
    let decoder = new Decoder(buffer)
    decoder.decode()
    return decoder._iconEntries
  },
  encode: (buffers) => {
    if  (!Array.isArray(buffers)) {
      buffers = [buffers]
    }
    let encoder = new Encoder(buffers)
    return encoder.encode()
  }
}