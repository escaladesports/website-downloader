'use strict'

/*

	- Check page
	- Crawl DOM for links
	

	const scraper = require('webs-teiscraper')

	new scraper({
		url: 'https://www.escaladesports.com/',
		path: './site',
		filterUrl: function(url){
	
		},
		filterContent: function(content){
			
		},
		alter: function(page){
			// page === { name: '', contents: '' }
		},
		urlFinder: 'string'
	}, err => {
		if(err) throw err
	})

*/

const jsdom = require('jsdom')

const defaultOptions = {
	getLinks: true,
	getStyles: true,
	getScripts: true,
	getImages: true,
	getContent: false,
	relativeLinks: false,
	method: 'dom',
	filter: href => { return true }
}

function scrapeLinks(url, opt, cb){

	// Find options
	if(typeof opt === 'function'){
		cb = opt
		opt = {}
	}
	if(typeof url === 'object') opt = url
	else opt.url = url

	let i
	for(i in defaultOptions){
		if(!(i in opt)){
			opt[i] = defaultOptions[i]
		}
	}


	jsdom.env({
		url: opt.url,
		done: (err, window) => {
			if(err) cb(err)

			const output = {}

			let i, els, link

			// Get links
			if(opt.getLinks){
				output.links = []
				els = window.document.querySelectorAll('a')
				for(i = 0; i < els.length; i++){
					link = els[i].href
					if(checkLink(link, opt)){
						output.links.push(link)
					}
				}
			}

			// Get images
			if(opt.getImages){
				output.images = []
				els = window.document.querySelectorAll('img')
				for(i = 0; i < els.length; i++){
					link = els[i].src
					if(link && checkLink(link, opt)){
						output.images.push(link)
					}
				}
			}

			// Get stylesheets
			if(opt.getStyles){
				output.styles = []
				els = window.document.querySelectorAll('link')
				for(i = 0; i < els.length; i++){
					if(els[i].rel && els[i].rel === 'stylesheet' && checkLink(els[i].href, opt)){
						output.styles.push(els[i].href)
					}
				}
			}

			// Get scripts
			if(opt.getScripts){
				output.scripts = []
				els = window.document.querySelectorAll('script')
				for(i = 0; i < els.length; i++){
					if(checkLink(els[i].src, opt)){
						output.scripts.push(els[i].src)
					}
				}
			}

			// Get custom links
			if('custom' in opt){
				let key
				let attr
				for(key in opt.custom){
					els = window.document.querySelectorAll(opt.custom[key].querySelector)
					output[key] = []
					for(i = 0; i < els.length; i++){
						attr = els[i].getAttribute(opt.custom[key].attribute)
						if(checkLink(attr, opt)){
							output[key].push(attr)
						}
					}
				}
			}

			if(opt.getMarkup === true){
				output.content = `<!DOCTYPE HTML>${window.document.documentElement.outerHTML}`
			}
			
			cb(false, output)

		}
	})
}



// Makes link relative
function relativeLink(currentPage, targetPage){

	// Remove domains
	currentPage = currentPage.split('//')[1].split('/')
	if(currentPage[currentPage.length - 1].indexOf('.') > -1){
		currentPage.shift()
	}
	targetPage = targetPage.split('//')[1].split('/')
	targetPage.shift()


	currentPage.pop()
	let i
	for(i = currentPage.length; i--;){
		currentPage[i] = '..'
	}


	// Rejoin paths
	currentPage = currentPage.join('/')
	targetPage = targetPage.join('/')

	return `${currentPage}/${targetPage}`
}


let link = relativeLink(
	'http://www.escaladesports.com/product/B5401W',
	'https://cdn.escaladesports.com/1200/B5401W_SB54_Main.jpg'
)
console.log(link)


// Validates link
function checkLink(link, opt){
	if(
		link &&
		link.indexOf('http') === 0 &&
		opt.filter(link)
	){
		if(opt.domains){
			let i
			let domain = link.split('//')[1].split('/')[0]
			if(opt.domains.indexOf(domain) === -1){
				return false
			}
		}
		return true
	}
}



module.exports = scrapeLinks


























