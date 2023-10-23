// declare function $(selector: string): {
// 	progressbar(options: string | { value: boolean }): ReturnType<typeof $>
// 	dialog(
// 		options:
// 			| 'open'
// 			| 'close'
// 			| Partial<{
// 					autoOpen: boolean
// 					closeOnEscape: boolean
// 					resizable: boolean
// 					modal: boolean
// 					width: number
// 					close(): void
// 					open(): void
// 			  }>
// 	): ReturnType<typeof $>
// }

const SIZE = 256

const form = document.querySelector('form')!
const btn = document.querySelector<HTMLInputElement>('input[type=button]')!

$('#loading-dialog').progressbar({
	value: false,
})

const dialogLoading = $('#loading-dialog').dialog({
	autoOpen: false,
	closeOnEscape: false,
	resizable: false,
	modal: true,
})

const dialogSuccess = $('#success-dialog').dialog({
	autoOpen: false,
	modal: true,
	width: 400,
	close: () => document.querySelector('#success-dialog img')!.remove(),
	open: () => dialogLoading.dialog('close'),
})

const dialogError = $('#error-dialog').dialog({
	autoOpen: false,
	modal: true,
	open: () => dialogLoading.dialog('close'),
})

function formData() {
	return {
		age: form.querySelector<HTMLInputElement>('#age')!.valueAsNumber,
		name: form.querySelector<HTMLInputElement>('#name')!.value,
		gender: form.querySelector<HTMLInputElement>('#genderf')!.checked ? 'female' : 'male',
		eyeColor: form.querySelector<HTMLInputElement>('#eye-color')!.value,
		hairColor: form.querySelector<HTMLInputElement>('#hair-color')!.value,
		hairLength: form.querySelector<HTMLSelectElement>('#hair-length')!.value,
		apiKey: form.querySelector<HTMLInputElement>('#api-key')!.value,
	}
}

async function getColorName(hex: string) {
	try {
		const res = await fetch(`https://www.thecolorapi.com/id?hex=${hex.slice(1)}`)
		const data = await res.json()
		return data.name.value
	} catch (error) {
		console.error('getColorName', error)
		throw error
	}
}

async function generateImage(params: {
	name: string
	gender: string
	eyeColor: string
	hairColor: string
	hairLength: string
	apiKey: string
	age: number
}) {
	try {
		const res = await fetch('https://api.openai.com/v1/images/generations', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${params.apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				prompt: `A cute catgirl, name: ${params.name}, age: ${params.age}, gender: ${params.gender}, eye color: ${params.eyeColor}, hair color: ${params.hairColor}, hair length: ${params.hairLength}`,
				n: 1,
				size: `${SIZE}x${SIZE}`,
			}),
		})

		const data = await res.json()
		console.log(data)

		return data.data?.[0]?.url
	} catch (error) {
		console.error('generateImage', error)
		throw error
	}
}

btn.addEventListener('click', async () => {
	btn.blur()
	if (!form.reportValidity()) return

	dialogLoading.dialog('open')

	const params = formData()
	console.log({ params })

	const eyeColor = await getColorName(params.eyeColor)
	console.log({ eyeColor })

	const hairColor = await getColorName(params.hairColor)
	console.log({ hairColor })

	const url = await generateImage(params)
	if (!url) {
		dialogError.dialog('open')
		return
	}

	const img = document.createElement('img')
	document.querySelector('#success-dialog #image')!.appendChild(img)
	img.src = url

	dialogSuccess.dialog('open')
})

form
	.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
		'input:not([type=button],[type=submit],[type=reset],[type=radio]),select'
	)
	.forEach(e => {
		if (localStorage[`input#${e.id}`]) e.value = localStorage[`input#${e.id}`]
		e.addEventListener('keyup', () => (localStorage[`input#${e.id}`] = e.value))
		e.addEventListener('input', () => (localStorage[`input#${e.id}`] = e.value))
	})

form.querySelectorAll<HTMLInputElement>('input[type=radio]').forEach(e => {
	if (localStorage[`input#${e.id}`]) e.checked = localStorage[`input#${e.id}`]
	e.addEventListener('keyup', () => (localStorage[`input#${e.id}`] = e.checked))
})
