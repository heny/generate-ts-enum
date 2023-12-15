import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { byStringGenerate, byFileGenerate } from './generate'

yargs(hideBin(process.argv))
  .command(
    'gte',
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
          type: 'string',
          demandOption: true,
        })
        .option('f', {
          alias: 'file',
          describe: '指定文件',
          type: 'string',
        })
    },
    async (argv) => {
      if (!argv.name) {
        console.error('缺少必需的选项：-n')
        process.exit(1)
      }

      if (argv.file) {
        byFileGenerate(argv.file, argv.name)
      } else {
        byStringGenerate(argv.array, argv.name)
      }
    }
  )
  .alias('v', 'version')
  .fail((msg, err, yargs) => {
    console.log(msg, '错误')
  })
  .help('h').argv
