'use strict'

export class log {
  static info(msg: string) {
  // eslint-disable-next-line no-console
    console.log(msg)
  }

  static warn(msg: string) {
    console.warn(msg)
  }

  static error(msg: string) {
    console.error(msg)
  }

  static debug(msg: string) {
    // eslint-disable-next-line no-console
    console.debug(msg)
  }

  static success(msg: string) {
    // eslint-disable-next-line no-console
    console.log(msg)
  }
}
