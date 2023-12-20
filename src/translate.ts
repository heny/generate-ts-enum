import { translate } from '@vitalets/google-translate-api'
import md5 from 'md5'
import axios from 'axios'
import config from './config'
import chalk from 'chalk'
import { sleep, preLog } from './utils'

type TranslateKey = 'googleFree' | 'baidu'

class Translate {
	private firstTranslation: boolean = true;
	private translateStatus: { [key in TranslateKey]: boolean } = {
		googleFree: true,
		baidu: true
	}

	// return true 终止翻译
	async checkTranslate(): Promise<boolean | void> {
		if (!this.firstTranslation) {
			// 仅在第二次及以后的调用使用 限制翻译速率 防止被拉黑ip
			await sleep(1000)
		}
		this.firstTranslation = false

		if (!this.translateStatus.baidu || !this.translateStatus.googleFree) {
			return true
		}
	}

	/**
	 * 谷歌翻译 没有限制
	 * @returns 
	 */
	async googleFreeTranslate(text: string, from = 'zh', to = 'en'): Promise<string> {
		const checkResult = await this.checkTranslate()
		if (checkResult) return ''
		preLog(`开始谷歌翻译：${text}`)
		return translate(text, { from, to })
			.then(res => res.text)
			.catch(() => {
				console.log(chalk.red('翻译失败，使用拼音转换!'))
				this.translateStatus.googleFree = false
				return ''
			})
	}

	/**
	 * 百度翻译 
	 * @returns 翻译失败返回空字符串
	 */
	async bdfanyi(text: string, from = 'zh', to = 'en'): Promise<string> {
		const checkResult = await this.checkTranslate()
		if (checkResult) return ''
		const { appid, key } = config.baseConfig.bdfinyi!
		if (!appid || !key) {
			console.log(chalk.red('请配置百度翻译的 appid 和 key'))
			process.exit(0)
		}
		const salt = new Date().getTime()
		const sign = md5(`${appid}${text}${salt}${key}`)
		const q = encodeURIComponent(text)
		const url = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${q}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`

		try {
			preLog(`开始百度翻译：${text}`)
			const { data } = await axios.get(url)

			if (data?.trans_result) {
				return data?.trans_result?.[0]?.dst
			}

			// 输出错误信息
			if (data.error_msg) {
				console.log(chalk.bgRed.white(`翻译失败：`), data)
				config.setBaseConfig('bdfinyi', {})
			}

			console.log(chalk.red('翻译失败，使用拼音转换!'))
			this.translateStatus.baidu = false
			return ''
		} catch (error: any) {
			console.log(chalk.red(`翻译失败：${error}, 将使用拼音转换!`))
			config.setBaseConfig('bdfinyi', {})
			this.translateStatus.baidu = false
			return ''
		}
	}
}

export default new Translate()