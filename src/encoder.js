/**
 * Encoder provides a method to encode PNG images into an ICO file. BMP images
 * do not work as masking is not implemented.
 */
class Encoder {
  /**
   * 
   * @param {[Buffer]} imageBuffers An array of image buffers containing images.
   */
  constructor(imageBuffers) {
    this._imageBuffers = imageBuffers.map(b => {
      if (b instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(b))
      } else if (b instanceof Buffer) {
        return b
      } else {
        throw 'Encoder requires ArrayBuffers or Buffers'
      }
    })
  }
  get buffer() {
    return this._buffer
  }
  /**
   * encode writes the stored image buffers into the internal buffer storage,
   * creating the appropriate ICONDIR, ICONDIRENTRY, and data locations.
   * 
   * @returns Buffer The resulting Buffer ready to be written to a file.
   */
  encode() {
    this._buffer = Buffer.alloc(0)
    this._bufferOffset = 0
    this._imageOffset = 0
    // Write our directory
    this._writeICONDIR()
    // Write our directory entries
    for (let i = 0; i < this._imageBuffers.length; i++) {
      this._writeICONDIRENTRY(i)
    }
    // Write our icon data
    for (let i = 0; i < this._imageBuffers.length; i++) {
      this._writeICONDATA(i)
    }
    return this._buffer
  }
  _writeICONDIR() {
    const buffer = Buffer.alloc(6)
    buffer.writeUInt16LE(0, 0)
    buffer.writeUInt16LE(1, 2)
    buffer.writeUInt16LE(this._imageBuffers.length, 4)
    this._imageOffset += 6
    this._buffer = Buffer.concat([this._buffer, buffer])
  }
  _writeICONDIRENTRY(index) {
    const imageData = this._imageBuffers[index]
    if (imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4E && imageData[3] === 0x47) {
      this._writeICONDIRENTRY_png(index)
    } else {
      this._writeICONDIRENTRY_bmp(index)
    }
  }
  _writeICONDIRENTRY_png(index) {
    const imageData = this._imageBuffers[index]
    const buffer = Buffer.alloc(16)
    // 8 = start, +4 = chunk length, +4 chunk type(IHDR)
    // Get information
    if (imageData[12] !== 73 && imageData[13] !== 72 && imageData[14] !== 68 && imageData[15] !== 82) {
      throw `PNG's first chunk must be an IHDR`
    }
    let width = imageData.readUInt32BE(16)
    let height = imageData.readUInt32BE(20)
    let bitsPerPixel = imageData.readUInt8(24)
    let colorType = imageData.readUInt8(25)
    let colorEntries = 0
    if (colorType === 3) { // indexed
      if (imageData[29] !== 'P' && imageData[30] !== 'L' && imageData[31] !== 'T' && imageData[32] !== 'E') {
        throw `PNG's second chunk must be a PLTE if indexed`
      }
      // I guess this is a way to acquire palettes...
      colorEntries = Math.ceil(imageData.readUInt32BE(25) / 3)
    }
    // Do some validation
    if (width > 256) {
      throw 'PNG width must not exceed 256'
    } else if (width === 256) {
      width = 0
    }
    if (height > 256) {
      throw 'PNG height must not exceed 256'
    } else if (height === 256) {
      height = 0
    }
    // Write width and height
    buffer.writeUInt8(width, 0)
    buffer.writeUInt8(height, 1)
    // Write color palettes
    buffer.writeUInt8(colorEntries, 2)
    // Write reserved
    buffer.writeUInt8(0, 3)
    // Write color planes
    buffer.writeUInt16LE(1, 4)
    // Write bbp
    buffer.writeUInt16LE(bitsPerPixel, 6)
    // Write image data size
    buffer.writeUInt32LE(imageData.length, 8)

    this._imageOffset += 16
    this._buffer = Buffer.concat([this._buffer, buffer])
  }
  _writeICONDIRENTRY_bmp(index) {
    const imageData = this._imageBuffers[index]
    const buffer = Buffer.alloc(16)
    // Get information
    let width = imageData.readInt32LE(18)
    let height = imageData.readInt32LE(22)
    let colorPlanes = imageData.readUInt16LE(26)
    let colorEntries = imageData.readUInt32LE(46)
    let bitsPerPixel = imageData.readUInt16LE(28)
    // Do some validation
    if (width > 256) {
      throw 'BMP width must not exceed 256'
    } else if (width === 256) {
      width = 0
    }
    if (height > 256) {
      throw 'BMP height must not exceed 256'
    } else if (height === 256) {
      height = 0
    }
    if (colorPlanes !== 1) {
      throw 'BMP color planes must be 1'
    }
    if (colorEntries === 0 && bitsPerPixel !== 32) {
      colorEntries = Math.pow(2, bitsPerPixel)
    }
    if (colorEntries > 256) {
      colorEntries = 0
    } else if (colorEntries === 256) {
      colorEntries = 255 // ???
    }
    // Write width and height
    buffer.writeUInt8(width, 0)
    buffer.writeUInt8(height, 1)
    // Write color palettes
    buffer.writeUInt8(colorEntries, 2)
    // Write reserved
    buffer.writeUInt8(0, 3)
    // Write color planes
    buffer.writeUInt16LE(colorPlanes, 4)
    // Write bbp
    buffer.writeUInt16LE(bitsPerPixel, 6)
    // Write image data size
    buffer.writeUInt32LE(imageData.length-14, 8)
    this._imageOffset += 16
    this._buffer = Buffer.concat([this._buffer, buffer])
  }
  _writeICONDATA(index) {
    let offsetOffset = (6+16) * index + (6 + 12)
    this._buffer.writeUInt32LE(this._imageOffset, offsetOffset)
    const imageData = this._imageBuffers[index]
    if (imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4E && imageData[3] === 0x47) {
      this._buffer = Buffer.concat([this._buffer, imageData])
      this._imageOffset += imageData.length
    } else {
      this._buffer = Buffer.concat([this._buffer, imageData.slice(14)])
      this._imageOffset += imageData.length - 14
    }
  }
}

export default Encoder
