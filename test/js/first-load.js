import axios from 'axios'
const url = 'https://api.vtbs.moe/v1/info'

const start = Date.now()
axios.get(url).then(response => {
  console.log(response.statusCode)
  const vtbs = JSON.parse(response.data)
  console.log(vtbs.length)
}).catch(error => {
  console.log(error)
}).finally(() => {
  const end = Date.now()
  console.log('time used:' + (end - start))
})
