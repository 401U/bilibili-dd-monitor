'use strict'

import chalk from 'chalk'

export class log {
  static info(msg: string) {
  // eslint-disable-next-line no-console
    console.log(msg)
  }

  static warn(msg: string) {
    // eslint-disable-next-line no-console
    console.warn(msg)
  }

  static error(msg: string) {
    // eslint-disable-next-line no-console
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
