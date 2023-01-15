import YAML from "yaml"
import md5 from "md5"
import crc32 from "crc32"

function $(component) {
	try {
		const elements = document.querySelectorAll(component)
		if (elements.length > 1) return elements
		else if (elements.length === 1) return elements[0]
	} catch (e) {}
	const template = document.createElement('template')
	template.innerHTML = component.trim()
	if (template.content.childNodes.length > 1) {
		return template.content.childNodes
	}
	return template.content.firstChild
}

function swap() {
	const value = input.value
	input.value = output.value
	output.value = value
}

function createControls() {
	Object.keys(formats).forEach(name => {
		const format = formats[name]
		const button = $(`<button class="btn" data-value="${format.value}">${format.name}</button>`)
		button.addEventListener("click", convert)
		actions.appendChild(button)
	})
	const button = $("<button class=\"btn\">↔</button>")
	button.addEventListener("click", swap)
	actions.appendChild(button)
}

function csvDecode(data, rowBreak = "\n", colBreak = "\t") {
	if (!data.includes(rowBreak) && !data.includes(colBreak)) {
		return null
	}
	const lines = data.split("\n")
	const keys = lines[0].trim().split("\t")
	lines.shift()
	return lines.map(line => {
		const item = {}
		line = line.split("\t")
		return keys.reduce((acc, val, index) => {
			acc[val] = line[index]
			return acc
		}, {})
	})
}

function csvEncode(data) {
	return data.reduce((acc, val, index) => {
		acc += Object.values(val).join("\t")
		acc += "\n"
		return acc
	}, Object.keys(data[0]).join("\t") + "\n")
}

function convert(e) {
	const detected = detect(input.value)
	console.log(detected)
	output.value = encode(detected, e.target.dataset.value)
}

function decode(data, format) {
	try {
		return formats[format].decoder(data)
	} catch (e) {
		return null
	}
}

function encode(data, format) {
	try {
		return formats[format].encoder(data)
	} catch (e) {
		return null
	}
}

function detect(input) {
	for (let format of Object.keys(formats)) {
		const item = formats[format]
		const data = decode(input, format)
		if (data && data !== input) {
			return {
				format,
				data,
				input
			}
		}
	}
	return {
		input,
		data: input
	}
}
const formats = {
	xml: {
		name: "XML",
		value: "xml",
	},
	json: {
		name: "JSON",
		value: "json",
		decoder: encoded => JSON.parse(encoded),
		encoder: decoded => JSON.stringify(decoded.data, null, 2),
	},
	base64: {
		name: "Base64",
		value: "base64",
		decoder: encoded => atob(encoded),
		encoder: decoded => decoded.format === "base64" ? decoded.data : btoa(decoded.input),
	},
	md5: {
		name: "MD5",
		value: "md5",
		encoder: decoded => md5(decoded.input),
	},
	crc32: {
		name: "CRC32",
		value: "crc32",
		encoder: decoded => crc32(decoded.input),
	},
	url: {
		name: "URL",
		value: "url",
		decoder: encoded => decodeURI(encoded),
		encoder: decoded => decoded.format === "url" ? decoded.data : encodeURI(decoded.input),
	},
	yaml: {
		name: "YAML",
		value: "yaml",
		decoder: encoded => YAML.parse(encoded),
		encoder: decoded => YAML.stringify(decoded.data),
	},
	csv: {
		name: "CSV",
		value: "csv",
		decoder: encoded => csvDecode(encoded),
		encoder: decoded => csvEncode(decoded.data),
	},
}
const input = $("#input")
const output = $("#output")
const actions = $("#actions")
createControls()