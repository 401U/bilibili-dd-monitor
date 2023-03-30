import axios from 'axios'
const roomid = 1603600
const url = `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomid}`
axios.get(url).then(response => {
  if (response.status === 200) {
    const result = JSON.parse(response.data)
    const hasSuccessResponse = result && result.code === 0 && result.data

    if (hasSuccessResponse) {
      const data = result.data
      const roomInfo = data.room_info
      const anchorInfo = data.anchor_info

      const mid = roomInfo.uid
      const roomId = roomInfo.room_id
      const uname = anchorInfo.base_info.uname
      const face = anchorInfo.base_info.face

      console.log(mid, roomId, uname, face)
    } else {
      // maybe invalid roomid parameter
      console.log('invalid response')
    }
  }
}).catch(error => {
  console.log(error)
})

console.log('log')
