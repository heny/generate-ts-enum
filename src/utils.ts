import chalk from 'chalk'
import dayjs from 'dayjs'

export function preLog(str: string) {
  const logPrefix = `[${chalk.blueBright(dayjs().format('HH:mm:ss'))}]:`
  console.log(logPrefix, str)
}

export function toJSON(str: string) {
  try {
    return typeof str === 'string' ? JSON.parse(str) : str
  } catch {
    console.error(chalk.red('转换失败：不是一个有效的数组'))
    return str
  }
}

export function evalToJSON(str: string) {
  try {
    const arr = eval(str);
    console.log(chalk.blue('输入的内容是：'), arr)
    if (Array.isArray(arr)) {
      return arr
    } else {
      console.error(chalk.red('输入的数组不是一个有效的数组'))
      process.exit(1)
    }
  } catch (error) {
    console.error(chalk.red('输入的数组不是一个有效的数组'))
    process.exit(1)
  }
}
