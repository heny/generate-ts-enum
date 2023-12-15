import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { init } from '.'

yargs(hideBin(process.argv))
  .command(
    'enum',
    '生成枚举和映射',
    (yargs) => {
      return yargs
        .option('a', {
          alias: 'array',
          describe: '输入的数组',
          type: 'string',
        })
        .option('n', {
          alias: 'name',
          describe: '变量名,输入中文会进行翻译',
          type: 'string'
        })
        .option('f', {
          alias: 'file',
          describe: '指定文件',
          type: 'string',
        })
        .option('labelKey', {
          describe: '要转换的label key',
          type: 'string',
          default: 'label',
          demandOption: true,
          requiresArg: true,
          group: 'Options:',
          prompt: {
            message: '请输入要转换的 label key:',
            type: 'string'
          }
        })
        .option('valueKey', {
          describe: '要转换的value key',
          type: 'string',
          default: 'value',
          demandOption: true,
          requiresArg: true,
          group: 'Options:',
          prompt: {
            message: '请输入要转换的 value key:',
            type: 'string'
          }
        })
        .option('k', {
          alias: 'inputKey',
          describe: '手动输入label value key',
          type: 'boolean',
        })
    },
    init
  )
  .alias('v', 'version')
  .fail((msg, err, yargs) => {
    console.log(msg, '错误')
  })
  .help('h').argv
