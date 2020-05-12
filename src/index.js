import Encoder from './encoder'
import Decoder from './decoder'

export { default as Encoder } from './encoder'
export { default as Decoder } from './decoder'

export const decode = (buffer) => {
  let decoder = new Decoder(buffer)
  return decoder.decode()
}

export const encode = (buffers) => {
  if  (!Array.isArray(buffers)) {
    buffers = [buffers]
  }
  let encoder = new Encoder(buffers)
  return encoder.encode()
}
