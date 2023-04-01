'use strict'

import chalk from 'chalk'

export class log {
  static info (msg: string) {
    console.log(chalk.blue('INFO '), msg)
  }

  static warn (msg: string) {
    console.log(chalk.yellow('WARN '), msg)
  }

  static error (msg: string) {
    console.log(chalk.inverse(chalk.red('ERROR ')), msg)
  }

  static debug (msg: string) {
    console.log(chalk.magenta('DEBUG '), msg)
  }

  static success (msg: string) {
    console.log(chalk.green('SUCCESS '), msg)
  }
}
