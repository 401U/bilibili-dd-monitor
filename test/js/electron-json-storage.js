const storage = require('electron-json-storage')

const data = storage.getSync('foobar')
console.log(data)
