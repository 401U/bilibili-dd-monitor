'use strict'

import chalk from 'chalk'

export class log {
  static info(msg: string) {
  // eslint-disable-next-line no-console
    console.log(chalk.blue('INFO '), msg)
  }

  static warn(msg: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.yellow('WARN '), msg)
  }

  static error(msg: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.inverse(chalk.red('ERROR ')), msg)
  }

  static debug(msg: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.magenta('DEBUG '), msg)
  }

  static success(msg: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.green('SUCCESS '), msg)
  }
}
