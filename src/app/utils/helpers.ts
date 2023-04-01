import chalk from 'chalk'
import type { VtbInfo } from '@/interfaces'

export function slog(title: any, content: any): void {
  // eslint-disable-next-line no-console
  console.log(chalk.inverse(chalk.blue(title)), content)
}

export function _compareByOnlineDesc(vtbInfoA: VtbInfo, vtbInfoB: VtbInfo): number {
  return vtbInfoB.online - vtbInfoA.online
}
