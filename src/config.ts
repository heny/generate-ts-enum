import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import { IConfig, Argv, Store, BaseConfig } from './constants'
import chalk from 'chalk'

class Config implements IConfig {
  private execStartTime: number
  argv: Argv
  store: Store

  constructor() {
    this.execStartTime = 0
    this.argv = {} as Argv
    this.store = {}
  }

  // 获取用户配置 ~/.generate-ts-gte.json 或者项目目录下
  get baseConfig(): BaseConfig {
    const filePath = this.baseConfigPath

    try {
      const config = fs.readJsonSync(filePath)
      return config
    } catch (err) {
      return {}
    }
  }

  get baseConfigPath() {
    return path.join(os.homedir(), '.generate-ts-gte.json')
  }

  setBaseConfig<T extends keyof BaseConfig>(key: T, value: BaseConfig[T]): void {
    const filePath = this.baseConfigPath;
    let existingConfig = {};

    try {
      if (fs.existsSync(filePath)) {
        existingConfig = fs.readJsonSync(filePath);
      }

      const newConfig = { [key]: value }

      // 写入到 ~/.generate-ts-gte.json 文件
      fs.writeJsonSync(filePath, { ...existingConfig, ...newConfig }, { spaces: 2 });
      console.log(chalk.green(`已更新到配置文件：${filePath}`), newConfig);
    } catch (err) {
      console.log(chalk.red(`写入配置文件时出错: ${err}`));
      process.exit(0)
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
