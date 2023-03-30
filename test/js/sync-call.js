import fetch from 'node-fetch'
// First, encapsulate into a Promise
const roomid = 243244324
const url = `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomid}`

// wrap in an promise
function downloadPage (url) {
  return new Promise((resolve, reject) => {
    fetch(url).then((response) => {
      if (response.status !== 200) {
        reject(new Error('Invalid status code <' + response.status + '>'))
      }
      resolve(response.data)
    }).catch((error) => {
      reject(error)
    })
  })
}

// now to program the "usual" way
// all you need to do is use async functions and await
// for functions returning promises
async function myBackEndLogic () {
  try {
    const html = await downloadPage(url)
    console.log('SHOULD WORK:')
    console.log(html)

    // try downloading an invalid url
    await downloadPage('http://      .com')
  } catch (error) {
    console.error('ERROR:')
    console.error(error)
  }
}

// run your async function
myBackEndLogic()
