import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import ExecutorInstance from '..'
import PromptInstance from '../prompt'
import { Argv } from '../constants'
import generateCommands from './generate'

yargs(hideBin(process.argv))
  .command<Argv>('enum', '生成枚举和映射', generateCommands, ExecutorInstance.execFn)
  .command(
    'write',
    '写入配置',
    (yargs) => {
      return yargs.option('bdf', {
        alias: 'bdfanyi',
        describe: '配置百度翻译key',
        type: 'boolean'
      })
    },
    function (argv) {
      if (argv.bdf) {
        PromptInstance.getBdFanyiKey()
      }
    }
  )
  .alias('v', 'version')
  .fail((msg, err, yargs) => {
    console.log(msg, '错误')
  })
  .help('h').argv
