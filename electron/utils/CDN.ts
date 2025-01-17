import ping from 'ping'
import { log } from './logger'

export default class CDN {
  private static readonly apiCDNList: string[] = [
    'api.vtbs.moe',
    'api.tokyo.vtbs.moe',
  ]

  static async getBestCDN(): Promise<string> {
    try {
      for (const host of this.apiCDNList) {
        const res = await ping.promise.probe(host)
        if (res.alive) {
          // do better: choose the smallest AVG delay cdn
          return `https://${host}`
        }
      }
    }
    catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      log.error(`PING CDN error: ${e}`)
    }
    // fallback cdn
    return 'https://api.vtbs.moe'
  }
}
