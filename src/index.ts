import { byPromptGetData, getName, getLabelKeyValue } from './prompt'
import { byStringGenerate, byFileGenerate } from './generate'

export async function init(argv) {
	const name = argv.name || await getName()
	if (!name) {
		console.error('缺少必需的选项：-n')
		process.exit(1)
	}

	let labelKey = argv.labelKey
	let valueKey = argv.valueKey

	if (argv.inputKey || !labelKey || !valueKey) {
		const answers = await getLabelKeyValue();
		labelKey = answers.labelKey
		valueKey = answers.valueKey
	}

	let option = { name, labelKey, valueKey }



	if (argv.file) {
		byFileGenerate(argv.file, option)
	}

	if (argv.array) {
		byStringGenerate(argv.array, option)
	}

	if (!argv.file && !argv.array) {
		byPromptGetData(option)
	}
}