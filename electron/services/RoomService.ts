import fetch from 'node-fetch'
import { log } from '../utils/logger'

// wrap in an promise
function wrapRequest(url: string) {
  return new Promise((resolve, reject) => {
    fetch(url).then((response) => {
      if (response.status !== 200)
        reject(new Error(`Invalid status code <${response.status}>`))

      resolve(response.text())
    }).catch((error) => {
      reject(error)
    })
  })
}

interface ResponseBody {
  code: number
  data: {
    room_info: {
      uid: number
      room_id: number
    }
    anchor_info: {
      base_info: {
        uname: string
        face: string
      }
    }
  }
}

export class RoomService {
  protected constructor() {
    // don't initiate it
  }

  static async getInfoByRoom(roomid: number) {
    const url = `https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomid}`

    const result = {
      isValid: false,
      info: {},
    }

    try {
      const bodyString = await wrapRequest(url) as string
      const body = JSON.parse(bodyString) as ResponseBody
      const hasSuccessResponse = body && body.code === 0 && body.data

      if (hasSuccessResponse) {
        const data = body.data
        const roomInfo = data.room_info
        const anchorInfo = data.anchor_info

        const mid = roomInfo.uid
        const roomid = roomInfo.room_id
        const uname = anchorInfo.base_info.uname
        const face = anchorInfo.base_info.face

        result.isValid = true
        Object.assign(result.info, {
          mid,
          roomid,
          uname,
          face,
        })
      }
      else {
        // maybe invalid roomid parameter
        log.error('invalid response')
      }
    }
    catch (e) {
      log.error(JSON.stringify(e))
    }

    return result
  }
}
