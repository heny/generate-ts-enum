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
    if (!argv.title) {
      await PromptInstance.getTitle()
    }
    if (!argv.title) {
      console.error('缺少必需的选项：-t')
      process.exit(1)
    }

    // 校验 label Key
    const { labelKey, valueKey, inputKey } = argv
    if (inputKey || !labelKey || !valueKey) {
      await PromptInstance.getLabelKeyValue()
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
