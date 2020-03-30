const fs = require('fs')
const ICOReader = require('./src/reader.js')

fs.readFile('./test.ico', (err, data) => {
  if (err) throw err
  let reader = new ICOReader(data)
  reader.read()
  reader._iconEntries.forEach((icon, index) => {
    //console.log(icon)
    fs.writeFile(`${index}.${icon.imageType}`, icon.imageData, { encoding: null }, err => {
      if (err) throw err
      console.log('wrote', index)
    })
  })
})
