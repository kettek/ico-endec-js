const ICO = require('./ico')

// ICO.
const formatICO = 1,
      formatCUR = 2

class Decoder extends ICO {
  constructor(buffer) {
    super()
    this._bufferOffset = 0
    this._buffer = buffer
    this._iconEntries = []
  }
  read() {
    // Read our header
    this.readICONDIR()
    // Read our image directory
    for (let i = 0; i < this._imageCount; i++) {
      this._iconEntries[i] = {
        width: -1,
        height: -1,
        colors: -1,
        colorPlanes: -1,
        bitsPerPixel: -1,
        horizontalHotspot: -1,
        verticalHotspot: -1,
        imageSize: -1,
        imageOffset: -1,
        imageData: null,
      }
      this.readICONDIRENTRY(i)
      // Read our image data
      this.readICONDATA(i)
    }
  }
  readICONDIR() {
    let buf
    buf = this._buffer.readUInt16LE(this._bufferOffset)
    this._bufferOffset += 2
    if (buf !== 0) {
      throw 'Reserved must be 0'
    }
    buf = this._buffer.readUInt16LE(this._bufferOffset)
    this._bufferOffset += 2
    if (buf === formatICO || buf === formatCUR) {
      this._type = buf
    } else {
      throw 'image type must be ICO or CUR'
    }
    buf = this._buffer.readUInt16LE(this._bufferOffset)
    this._bufferOffset += 2
    this._imageCount = buf
  }
  readICONDIRENTRY(target) {
    let buf
    // Read width
    buf = this._buffer.readUInt8(this._bufferOffset)
    this._bufferOffset++
    if (buf === 0) {
      this._iconEntries[target].width = 256
    } else {
      this._iconEntries[target].width = buf
    }
    // Read height
    buf = this._buffer.readUInt8(this._bufferOffset)
    this._bufferOffset++
    if (buf === 0) {
      this._iconEntries[target].height = 256
    } else {
      this._iconEntries[target].height = buf
    }
    // Read number of colors
    buf = this._buffer.readUInt8(this._bufferOffset)
    this._bufferOffset++
    this._iconEntries[target].colors = buf
    // Read reserved.
    buf = this._buffer.readUInt8(this._bufferOffset)
    this._bufferOffset++
    if (buf !== 0) {
      throw 'Reserved must be 0'
    }
    // Read color planes or horizontal hotspot
    buf = this._buffer.readUInt16LE(this._bufferOffset)
    this._bufferOffset += 2
    if (this._type === formatICO) {
      if (buf !== 0 && buf !== 1) {
        throw `Color plane was ${buf}, should be 0 or 1`
      }
      this._iconEntries[target].colorPlanes = buf
    } else if (this._type === formatCUR) {
      this._iconEntries[target].horizontalHotspot = buf
    }
    // Read bits per pixel or vertical hotspot
    buf = this._buffer.readUInt16LE(this._bufferOffset)
    this._bufferOffset += 2
    if (this._type === formatICO) {
      this._iconEntries[target].bitsPerPixel = buf
    } else if (this._type === formatCUR) {
      this._iconEntries[target].verticalHotspot = buf
    }
    // Read the size of the image data.
    buf = this._buffer.readUInt32LE(this._bufferOffset)
    this._bufferOffset += 4
    this._iconEntries[target].imageSize = buf
    // Read the offset of the image data.
    buf = this._buffer.readUInt32LE(this._bufferOffset)
    this._bufferOffset += 4
    this._iconEntries[target].imageOffset = buf
  }
  readICONDATA(index) {
    const icon = this._iconEntries[index]
    let imageData = Buffer.from(this._buffer.buffer, icon.imageOffset, icon.imageSize)
    if (imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4E && imageData[3] === 0x47) {
      icon.imageData = imageData
      icon.imageType = 'png'
    } else {
      icon.imageType = 'bmp'
      // Get the info header size
      let headerSize = imageData.readUInt32LE(0)
      // Overwrite width/height with ICO defined (GIMP stored a 16x16 BMP in an ICO as 16x32... for some reason)
      imageData.writeInt32LE(icon.width, 4)
      imageData.writeInt32LE(icon.height, 8)
      let bitsPerPixel = imageData.readUInt16LE(14)
      // Check if we have BI_BITFIELDS (increases bitmap data offset by 12)
      let hasBitFields = imageData.readUInt32LE(16) === 3
      // Get the count of palettes
      let paletteEntries = imageData.readUInt32LE(32)
      if (paletteEntries === 0 && bitsPerPixel !== 32) {
        paletteEntries = Math.pow(2, bitsPerPixel)
      }
      // Get the paletteColorSize -- BITMAPCOREHEADER is 3 bytes, otherwise 4
      let paletteColorSize = headerSize === 12 ? 3 : 4
      let colorTableOffset = headerSize + (hasBitFields ? 12 : 0)
      let colorTableSize = paletteEntries * paletteColorSize
      // Find the starting address of the pixel data.
      let pixelDataOffset = colorTableOffset + colorTableSize
      // Build our bitmap header.
      let bitmapHeader = Buffer.alloc(14)
      // Write BM header field.
      bitmapHeader.writeUInt8(0x42, 0)
      bitmapHeader.writeUInt8(0x4D, 1)
      // Write file size
      bitmapHeader.writeUInt32LE(icon.imageSize+14, 2)
      // Write pixel data offset.
      bitmapHeader.writeUInt32LE(pixelDataOffset+14, 10)
      icon.imageData = Buffer.concat([bitmapHeader, imageData])
    }
  }
}

module.exports = Decoder