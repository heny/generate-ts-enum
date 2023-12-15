import inquirer, { Answers, QuestionCollection } from 'inquirer'
import os from 'os'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { evalToJSON } from './utils'
import { byStringGenerate, byFileGenerate } from './generate'
import { GenerateOption } from './constants'

function prompts<T extends Answers>(questions: QuestionCollection<T>): Promise<T> {
	return new Promise<T>(resolve => {
		inquirer
			.prompt<T>(questions)
			.then(resolve)
	})
}

async function fetchVimContent() {
	return new Promise((resolve, reject) => {
		// 创建一个临时文件
		const tempFile = path.join(os.tmpdir(), 'generate-ts-enum.json')

		const vim = spawn('vim', [tempFile], {
			stdio: 'inherit', // 这将会把子进程的stdio连接到父进程
		})

		vim.on('exit', () => {
			// 读取临时文件的内容之后并删除
			const text = fs.readFileSync(tempFile, 'utf-8')
			fs.unlinkSync(tempFile)

			resolve(evalToJSON(text))
		})
	})
}

export async function byPromptGetData(option: GenerateOption) {
	const answers = await prompts<{ dataChoice: 'file' | 'vim' | 'input' }>([
		{
			type: 'list',
			name: 'dataChoice',
			message: '请选择提供数据的方式:',
			choices: [
				{ name: '手动输入', value: 'input' },
				{ name: '以文件方式', value: 'file' },
				{ name: 'Vim输入方式', value: 'vim' }
			],
		},
	]);

	if(answers.dataChoice === 'input') {
		const inputAnswers = await prompts<{ content: string }>([
			{
				type: 'input',
				name: 'content',
				message: '请按正确格式输入数组对象：'
			}
		])

		byStringGenerate(evalToJSON(inputAnswers.content), option)
	}

	if (answers.dataChoice === 'file') {
		const fileAnswers = await prompts<{ filePath: string }>([
			{
				type: 'input',
				name: 'filePath',
				message: '请输入文件的路径:',
			},
		]);

		byFileGenerate(fileAnswers.filePath, option)
	}

	if (answers.dataChoice === 'vim') {
		const vimAnswers = await prompts<{ openVim: boolean }>([
			{
				type: 'confirm',
				name: 'openVim',
				message: '是否打开vim编辑器?',
				default: false,
			},
		]);

		if (vimAnswers.openVim) {
			const array = await fetchVimContent();
			return byStringGenerate(array, option);
		}
	}
}

export async function getName() {
	const answers = await prompts([
		{
			type: 'input',
			name: 'name',
			message: '请输入枚举名字：',
			default: ''
		}
	])
	return Promise.resolve(answers.name)
}

export async function getLabelKeyValue(): Promise<{ labelKey: string, valueKey: string }> {
  const questions = [
    {
      type: 'text',
      name: 'labelKey',
      message: '请输入对象的labelKey：',
			default: 'label'
    },
    {
      type: 'text',
      name: 'valueKey',
      message: '请输入对象的valueKey：',
			default: 'value'
    }
  ];

  const response = await prompts(questions);
  return response;
}
