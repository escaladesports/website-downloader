'use strict'
const scrapePage = require('./app')
const path = require('path')

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
	relativeLinks: false,
	getContent: true,
	postDomTransform: function(window){
		window.document.body.classList.add('offline')
	},
	postStringTransform: function(str){
		str = str.replace(/https:\/\/cdn.escaladesports.com/g, '')
		return str
	}
}, (err, content) => {
	if(err) throw err

	console.log('DONE!')

})
