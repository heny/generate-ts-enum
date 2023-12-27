import chalk from 'chalk'
import dayjs from 'dayjs'
import NodeDebug from 'debug'

export const debugLog = NodeDebug('gte')

export function flat(arr) {
  return arr.reduce(function (prev, curr) {
    return prev.concat(Array.isArray(curr) ? flat(curr) : curr)
  }, [])
}

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
    const arr = eval(str)
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

function wordToUpperCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// 将数组拼接成upper-case
export function toUpperCase(arr) {
  if (typeof arr === 'string') {
    return wordToUpperCase(arr)
  }
  arr = flat(arr)
  return arr.reduce((result, item) => {
    return result + wordToUpperCase(item)
  }, '')
}

export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
