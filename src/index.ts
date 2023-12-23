import PromptInstance from './prompt'
import GenerateInstance from './generate'
import config from './config'
import { Argv } from './constants'

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

    // 检验输出文件
    if (typeof argv.output !== 'undefined') {
      await PromptInstance.checkOutput()
    } else if (!argv.output) {
      await PromptInstance.promptOutPut()
    }
  }

  async execFn(argv: Argv) {
    config.setStartTime(Date.now())
    config.setFullArgv(argv)
    await this.checkArgv(argv)

    if (argv.bdfanyi) {
      await PromptInstance.getBdFanyiKey()
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
