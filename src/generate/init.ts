import PromptInstance from '../prompt'
import GenerateInstance from './handle'
import TranslateInstance from '../translate'
import config from '../config'
import { Argv } from '../constants'

class Executor {
  constructor() {
    this.checkArgv = this.checkArgv.bind(this)
    this.execFn = this.execFn.bind(this)
  }

  async checkArgv(argv: Argv) {
    let title = argv.title
    if (!title) {
      title = await PromptInstance.getTitle()
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
      const { labelKey, valueKey } = await PromptInstance.getLabelKeyValue()
      config.setArgv('labelKey', labelKey)
      config.setArgv('valueKey', valueKey)
    }

    if (!argv.output) {
      await PromptInstance.promptOutPut()
    }
  }

  async execFn(argv: Argv) {
    config.setStartTime(Date.now())
    config.setFullArgv(argv)
    await this.checkArgv(argv)

    if (argv.bdfanyi) {
      await TranslateInstance.getBdFanyiKey()
    }

    await PromptInstance.promptOutputType()

    if (argv.file) {
      GenerateInstance.byFileGenerate(argv.file)
    }

    if (argv.array) {
      GenerateInstance.byStringGenerate(argv.array)
    }

    if (!argv.file && !argv.array) {
      PromptInstance.byPromptGetData()
    }
  }
}

export default new Executor()