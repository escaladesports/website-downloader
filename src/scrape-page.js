'use strict'
const path = require('path')
const jsdom = require('jsdom')
const checkLink = require('./validate')
const relativeLink = require('./relative-link')

// Parses links from a page and returns content
function scrapePage(url, opt, cb){

	jsdom.env({
		url: url,
		done: (err, window) => {
			if(err) cb(err)

			const output = {}

			let i, els, link

			// Apply transforms
			if('transformDom' in opt){
				opt.transformDom(window)
			}

			// Get links
			if(opt.getLinks){
				output.links = []
				els = window.document.querySelectorAll('a')
				for(i = 0; i < els.length; i++){
					link = els[i].href
					if(checkLink(link, opt)){
						output.links.push(link)
						if(opt.relativeLinks === true){
							link = path.relative(url, link)
							if(!link) link = '../'
							els[i].setAttribute('href', link)
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
							els[i].setAttribute('src', path.relative(url, link))
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
							els[i].setAttribute('href', path.relative(url, link))
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
							els[i].setAttribute('src', path.relative(url, link))
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
								els[i].setAttribute(opt.custom[key].attribute, path.relative(url, link))
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







module.exports = scrapePage
