import { VtbInfo } from '@/interfaces'
import chalk from 'chalk'

export const slog = (title: any, content: any): void => {
  console.log(chalk.inverse(chalk.blue(title)), content)
}

export const _compareByOnlineDesc = (vtbInfoA: VtbInfo, vtbInfoB: VtbInfo): number => {
  return vtbInfoB.online - vtbInfoA.online
}
