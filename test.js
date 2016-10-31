'use strict'

const scrapeLinks = require('./app')

scrapeLinks('http://www.escaladesports.com/product/B5401W', {
	domains: [
		'www.escaladesports.com',
		'escaladesports.com',
		'cdn.escaladesports.com'
	],
	custom: {
		dataFull: {
			querySelector: 'a[data-full]',
			attribute: 'data-full'
		}
	},
	relativeLinks: true,
	content: true,
	method: 'string'
}, (err, content) => {
	if(err) throw err

	console.log(JSON.stringify(content, null, 4))
})