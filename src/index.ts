import { byPromptGetData, getName, getLabelKeyValue, promptOutPut } from './prompt'
import { byStringGenerate, byFileGenerate } from './generate'
import config from './config'

async function checkArgv(argv) {
  let name = argv.name
  if (!name) {
    name = await getName()
    config.setArgv('name', name)
  }
  if (!name) {
    console.error('缺少必需的选项：-n')
    process.exit(1)
  }

  // 校验 label Key
  let labelKey = argv.labelKey
  let valueKey = argv.valueKey
  if (argv.inputKey || !labelKey || !valueKey) {
    const { labelKey, valueKey } = await getLabelKeyValue()
    config.setArgv('labelKey', labelKey)
    config.setArgv('valueKey', valueKey)
  }

  if (!argv.hasOutPutFile && !argv.output) {
    await promptOutPut()
  }
}

export async function execFn(argv) {
  config.setStartTime(Date.now())
  config.setFullArgv(argv)
  await checkArgv(argv)

  if (argv.file) {
    byFileGenerate(argv.file)
  }

  if (argv.array) {
    byStringGenerate(argv.array)
  }

  if (!argv.file && !argv.array) {
    byPromptGetData()
  }
}
