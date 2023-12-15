import chalk from 'chalk'
import dayjs from 'dayjs'

export function preLog(str: string) {
  const logPrefix = `[${chalk.blueBright('web')}/${chalk.blueBright(dayjs().format('HH:mm:ss'))}]:`
  console.log(logPrefix, str)
}

export function toJSON(str: string) {
  try {
    const arr = JSON.parse(str)
    return arr
  } catch {
    console.error(chalk.red('转换失败：不是一个有效的数组'))
    return str
  }
}
