import { byPromptGetData, getTitle, getLabelKeyValue, promptOutPut } from './prompt'
import { byStringGenerate, byFileGenerate } from './generate'
import config from './config'

async function checkArgv(argv) {
  let title = argv.title
  if (!title) {
    title = await getTitle()
    config.setArgv('title', title)
  }
  if (!title) {
    console.error('缺少必需的选项：-t')
    process.exit(1)
  }

  // 校验 label Key
  const curLabelKey = argv.labelKey
  const curValueKey = argv.valueKey
  if (argv.inputKey || !curLabelKey || !curValueKey) {
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
