import { translate } from '@vitalets/google-translate-api'
import md5 from 'md5'
import axios from 'axios'
import config from './config'
import chalk from 'chalk'
import PromptInstance from './prompt'
import { sleep, preLog, debugLog, to } from './utils'
import { TranslateKey, CaiYunType, BaseConfig } from './constants'

/**
 * 校验装饰器,使用类内部的checkTranslate
 * 翻译的功能都需要调用一下该方法
 */
function CheckTranslate(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	descriptor.value = async function (...args: any[]) {
		// 第一个参数必须存在
		const oneArg = args[0]
		if (typeof oneArg !== 'string' || oneArg === '' || oneArg === undefined) {
			console.log(chalk.red('第一个参数必须为string，并且必须存在!'))
			return ''
		}

		// @ts-ignore 这里this是用的地方的this
		const checkResult = await this.checkTranslate();
		if (checkResult) return '';
		return originalMethod.apply(this, args);
	};
	return descriptor;
}

class Translate {
	private firstTranslation: boolean = true;
	// 翻译状态是否成功
	private translateStatus: { [key in TranslateKey]: boolean } = {
		googleFree: true,
		baidu: true,
		caiyun: true
	}

	// 是否可翻译
	get translateAvalible() {
		// 只要有一个翻译key为false，就终止翻译，因为一次只能使用一种翻译
		const result = Object.values(this.translateStatus).every(Boolean)
		if (!result && this.firstTranslation) {
			this.firstTranslation = false
			console.log(chalk.red('翻译失败，使用拼音转换!'))
		}
		return result
	}

	// return true 终止翻译
	async checkTranslate(): Promise<boolean | void> {
		if (!this.translateAvalible) return true
		if (!this.firstTranslation) {
			// 仅在第二次及以后的调用使用 限制翻译速率 防止被拉黑ip
			await sleep(1000)
		}
		this.firstTranslation = false
	}

	/**
	 * 谷歌翻译 没有限制
	 * @returns 
	 */
	@CheckTranslate
	async googleFreeTranslate(text: string, from = 'zh', to = 'en'): Promise<string> {
		preLog(`开始谷歌翻译：${text}`)
		return translate(text, { from, to })
			.then(res => res.text)
			.catch((err) => {
				debugLog(err)
				this.translateStatus.googleFree = false
				return ''
			})
	}

	/**
	 * 百度翻译 
	 * @returns 翻译失败返回空字符串
	 */
	@CheckTranslate
	async bdfanyi(text: string, from = 'zh', to = 'en'): Promise<string> {
		const isEnum = config.getStore('command')
		let { appid, key } = config.baseConfig?.bdfinyi || {}
		if (!appid || !key) {
			console.log(chalk.red('请配置百度翻译的 appid 和 key：'))
			const newConfig = await this.setBdFanyiKey()
			appid = newConfig.appid
			key = newConfig.key
		}
		const salt = new Date().getTime()
		const sign = md5(`${appid}${text}${salt}${key}`)
		const q = encodeURIComponent(text)
		const url = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${q}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`

		try {
			if (isEnum === 'enum') preLog(`开始百度翻译：${text}`)
			const { data } = await axios.get(url)

			if (data?.trans_result) {
				return data?.trans_result?.[0]?.dst
			}

			// 输出错误信息
			if (data.error_msg) {
				console.log(chalk.bgRed.white(`翻译失败：`), data)
				// config.setBaseConfig('bdfinyi', {})
			}

			// console.log(chalk.red('翻译失败，使用拼音转换!'))
			this.translateStatus.baidu = false
			return ''
		} catch (error: any) {
			console.log(chalk.red(`翻译失败：${error}!`))
			// config.setBaseConfig('bdfinyi', {})
			this.translateStatus.baidu = false
			return ''
		}
	}

	/**
	 * @name 彩云翻译
	 * @param source  要翻译的文本, 传入数组则批量翻译
	 * @returns 
	 */
	@CheckTranslate
	async caiyunTranslate(source, from: CaiYunType = 'zh', target: CaiYunType = 'en') {
		const isEnum = config.getStore('command')
		// 如果没配置token则使用测试的token
		const token = config.baseConfig.caiyun || '3975l6lr5pcbvidl6jl2'
		const url = "http://api.interpreter.caiyunai.com/v1/translator";

		const payload = {
			"source": source,
			"trans_type": `${from}2${target}`,
			"request_id": "demo",
			"detect": true,
		}
		const headers = {
			"content-type": "application/json",
			"x-authorization": "token " + token,
		};
		if (isEnum === 'enum') preLog(`开始彩云翻译：${source}`)
		const [error, response] = await to(axios.post(url, payload, { headers: headers }))

		// 失败
		if (error) {
			this.translateStatus.caiyun = false;
			// @ts-ignore
			console.log(chalk.red(`翻译失败：`), error.response.data)
			// config.setBaseConfig('caiyun', '')
			return ''
		}

		return response.data["target"];
	}

	// 写入百度翻译配置
	async setBdFanyiKey(): Promise<BaseConfig['bdfinyi']> {
		const questions = await PromptInstance.prompts<BaseConfig['bdfinyi']>([
			{
				type: 'text',
				name: 'appid',
				message: '请输入百度appid：',
			},
			{
				type: 'text',
				name: 'key',
				message: '请输入百度密钥：',
			},
		])
		config.setBaseConfig('bdfinyi', questions)
		return questions
	}

	// 写入caiyun token
	async setCaiyunToken(): Promise<string> {
		const questions = await PromptInstance.prompt({
			message: '请输入彩云token：'
		})
		config.setBaseConfig('caiyun', questions)
		return questions
	}

	// 使用什么翻译
	async setTranslateType(): Promise<TranslateKey> {
		const base = config.baseConfig
		const questions = await PromptInstance.prompt<TranslateKey>(
			{
				type: 'list',
				message: '请选择翻译类型：',
				choices: [
					{ name: '谷歌免费翻译', value: 'googleFree' },
					{ name: '百度翻译(需要自己提供token)', value: 'baidu' },
					{ name: '彩云小译(有测试token)', value: 'caiyun' },
				],
				default: base.translateType
			},
		)
		config.setBaseConfig('translateType', questions)
		return questions
	}

	async byTypeTranslate(text: string, type?: TranslateKey, from?, to?) {
		let result = ''
		switch (type) {
			case 'baidu':
				result = await this.bdfanyi(text, from, to)
				break
			case 'googleFree':
				result = await this.googleFreeTranslate(text, from, to)
				break
			// 默认使用caiyun
			case 'caiyun':
			default:
				result = await this.caiyunTranslate(text, from as CaiYunType, to as CaiYunType);
		}
		return result
	}
}

export default new Translate()