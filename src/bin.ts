import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import config from './config'
import ExecutorInstance from './generate/init'
import TranslateInstance from './translate'
import { Argv } from './constants'
import generateCommands from './generate/command'

yargs(hideBin(process.argv))
  .command<Argv>('enum', '生成枚举和映射', generateCommands, ExecutorInstance.execFn)
  .command('write', '写入配置',
    (yargs) => {
      return yargs.option('bdf', {
        alias: 'bdfanyi',
        describe: '配置百度翻译key',
        type: 'boolean'
      })
    },
    async function (argv) {
      if (argv.bdf) {
        await TranslateInstance.getBdFanyiKey()
      }
    }
  )
  .command('config', '获取配置文件',
    () => console.log(chalk.green('当前配置路径：', config.baseConfigPath))
  )
  .alias('v', 'version')
  .fail((msg, err, yargs) => {
    console.log(msg, '错误')
  })
  .help('h').argv
