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
	relativeScripts: false,
	relativeStyles: false,
	relativeImages: false,
	relativeCustom: false,
	removeUrlParameters: true,
	getContent: true,
	linkTransform: function(link){
		while(link.indexOf('../') === 0){
			link = link.replace('../', '')
		}
		if(link.indexOf('/') === 0){
			link = link.replace('/', '')
		}
		return link
	},
	postDomTransform: function(window){

		// Add offline class
		window.document.body.classList.add('offline')

		// Remove analytics script
		var analytics = window.document.querySelector('script:not([src])')
		analytics.parentNode.removeChild(analytics)



	},
	postStringTransform: function(str){
		str = str.replace(/https:\/\/cdn.escaladesports.com/g, '')
		return str
	}
}, (err, content) => {
	if(err) throw err

	console.log('DONE!')

})
