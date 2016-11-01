'use strict'

const scrapePage = require('./app')

scrapePage('http://www.escaladesports.com/', {
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
	getContent: true,
	transformDom: function(window){
		window.document.body.classList.add('offline')
	}
}, (err, content) => {
	if(err) throw err

	console.log('DONE!')

})