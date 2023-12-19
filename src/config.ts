import { IConfig, Argv, Store } from './constants'

class Config implements IConfig {
  private execStartTime: number
  argv: Argv
  store: Store

  constructor() {
    this.execStartTime = 0
    this.argv = {} as Argv
    this.store = {
      outputType: [],
    }
  }

  get startTime(): number {
    return this.execStartTime
  }

  setStartTime(startTime: number): void {
    this.execStartTime = startTime
  }

  getStore<K extends keyof Store>(key: K): Store[K] {
    return this.store[key]
  }

  setStore<K extends keyof Store>(key: K, value: Store[K]): void {
    this.store[key] = value
  }

  setArgv<K extends keyof Argv>(key: K, value: Argv[K]): void {
    this.argv[key] = value
  }

  setFullArgv(argv: Argv) {
    this.argv = argv
  }
}

export default new Config()
