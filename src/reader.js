// ICO.
const ICO = 1,
      CUR = 2,
      PNG = 1,
      BMP = 2

class ICOReader {
  constructor(buffer) {
    this._bufferOffset = 0
    this._buffer = Buffer.from(buffer)
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
    }
    // Read our image data
    this._iconEntries.forEach((icon, i) => {
      icon.imageData = Buffer.from(this._buffer, icon.imageOffset, icon.imageSize)
      if (icon.imageData[0] === 0x89 && icon.imageData[1] === 0x50 && icon.imageData[2] === 0x4E && icon.imageData[3] === 0x47) {
        icon.imageType = PNG
      } else {
        icon.imageType = BMP
      }
    })
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
    if (buf === 1 || buf === 2) {
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
    if (this._type === ICO) {
      if (buf !== 0 && buf !== 1) {
        throw `Color plane was ${buf}, should be 0 or 1`
      }
      this._iconEntries[target].colorPlanes = buf
    } else if (this._type === CUR) {
      this._iconEntries[target].horizontalHotspot = buf
    }
    // Read bits per pixel or vertical hotspot
    buf = this._buffer.readUInt16LE(this._bufferOffset)
    this._bufferOffset += 2
    if (this._type === ICO) {
      this._iconEntries[target].bitsPerPixel = buf
    } else if (this._type === CUR) {
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
}

module.exports = ICOReader
