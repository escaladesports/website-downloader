'use strict'
const jsdom = require('jsdom')

// Parses links from a page and returns content
function scrapePage(url, opt, cb){

	jsdom.env({
		url: url,
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
						if(opt.relativeLinks === true){
							els[i].setAttribute('href', relativeLink(url, link))
						}
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
						if(opt.relativeLinks === true){
							els[i].setAttribute('src', relativeLink(url, link))
						}
					}
				}
			}

			// Get stylesheets
			if(opt.getStyles){
				output.styles = []
				els = window.document.querySelectorAll('link')
				for(i = 0; i < els.length; i++){
					link = els[i].href
					if(els[i].rel && els[i].rel === 'stylesheet' && checkLink(link, opt)){
						output.styles.push(link)
						if(opt.relativeLinks === true){
							els[i].setAttribute('href', relativeLink(url, link))
						}
					}
				}
			}

			// Get scripts
			if(opt.getScripts){
				output.scripts = []
				els = window.document.querySelectorAll('script')
				for(i = 0; i < els.length; i++){
					link = els[i].src
					if(checkLink(link, opt)){
						output.scripts.push(link)
						if(opt.relativeLinks === true){
							els[i].setAttribute('src', relativeLink(url, link))
						}
					}
				}
			}

			// Get custom links
			if('custom' in opt){
				let key
				for(key in opt.custom){
					els = window.document.querySelectorAll(opt.custom[key].querySelector)
					output[key] = []
					for(i = 0; i < els.length; i++){
						link = els[i].getAttribute(opt.custom[key].attribute)
						if(checkLink(link, opt)){
							output[key].push(link)
							if(opt.relativeLinks === true){
								els[i].setAttribute(opt.custom[key].attribute, relativeLink(url, link))
							}
						}
					}
				}
			}

			if(opt.getContent === true){
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
	currentPage.shift()


	// If file, back up to current directory
	if(currentPage[currentPage.length - 1].indexOf('.') > -1){
		currentPage.pop()
	}
	targetPage = targetPage.split('//')[1].split('/')
	targetPage.shift()

	if(currentPage[currentPage.length - 1] === ''){
		currentPage.pop()
	}


	let i
	for(i = currentPage.length; i--;){
		currentPage[i] = '..'
	}


	// Rejoin paths
	currentPage = currentPage.join('/')
	targetPage = targetPage.join('/')

	if(currentPage) currentPage = currentPage + '/'


	return `${currentPage}${targetPage}`
}




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



module.exports = scrapePage
