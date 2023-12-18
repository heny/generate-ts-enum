import { IConfig, Argv } from './constants'

class Config implements IConfig {
  private execStartTime: number
  argv: Argv

  constructor() {
    this.execStartTime = 0
    this.argv = {} as Argv
  }

  get startTime(): number {
    return this.execStartTime
  }

  setArgv<K extends keyof Argv>(key: K, value: Argv[K]): void {
    this.argv[key] = value
  }

  setFullArgv(argv: Argv) {
    this.argv = argv
  }

  setStartTime(startTime: number): void {
    this.execStartTime = startTime
  }
}

export default new Config()
