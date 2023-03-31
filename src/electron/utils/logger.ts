'use strict'

// import chalk from 'chalk'

export class log {
  static info (msg: string) {
    // console.log(chalk.blue('INFO ') + msg)
    console.log('INFO ' + msg)
  }

  static warn (msg: string) {
    // console.log(chalk.yellow('WARN ') + msg)
    console.log('WARN ' + msg)
  }

  static error (msg: string) {
    // console.log(chalk.red('ERROR ') + msg)
    console.log('ERROR ' + msg)
  }

  static debug (msg: string) {
    // console.log(chalk.magenta('DEBUG ') + msg)
    console.log('DEBUG ' + msg)
  }

  static success (msg: string) {
    // console.log(chalk.green('SUCCESS ') + msg)
    console.log('SUCCESS ' + msg)
  }
}
