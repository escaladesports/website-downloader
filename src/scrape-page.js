'use strict'
const path = require('path')
const url = require('url')
const jsdom = require('jsdom')
const checkLink = require('./validate')

// Parses links from a page and returns content
function scrapePage(url, opt, cb){

	jsdom.env({
		url: url,
		done: (err, window) => {
			if(err) cb(err)

			const output = {}

			let i, els, link

			// Apply transforms
			if('preDomTransform' in opt){
				opt.preDomTransform(window)
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
							link = path.relative(removeDomain(url), removeDomain(link))
							if(!link) link = '../'
							els[i].setAttribute('href', link)
						}
						else if('linkTransform' in opt){
							els[i].setAttribute('href', opt.linkTransform(els[i].getAttribute('href')))
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
						if(opt.relativeImages === true){
							link = path.relative(removeDomain(url), removeDomain(link))
							els[i].setAttribute('src', link)
						}
						else if('linkTransform' in opt){
							els[i].setAttribute('src', opt.linkTransform(els[i].getAttribute('src')))
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
						if(opt.relativeStyles === true){
							link = path.relative(removeDomain(url), removeDomain(link))
							els[i].setAttribute('href', link)
						}
						else if('linkTransform' in opt){
							els[i].setAttribute('href', opt.linkTransform(els[i].getAttribute('href')))
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
						if(opt.relativeScripts === true){
							link = path.relative(removeDomain(url), removeDomain(link))
							els[i].setAttribute('src', link)
						}
						else if('linkTransform' in opt){
							els[i].setAttribute('src', opt.linkTransform(els[i].getAttribute('src')))
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
							if(opt.relativeCustom === true){
								link = path.relative(removeDomain(url), removeDomain(link))
								els[i].setAttribute(opt.custom[key].attribute, link)
							}
							else if('linkTransform' in opt){
								els[i].setAttribute(opt.custom[key].attribute, opt.linkTransform(els[i].getAttribute(opt.custom[key].attribute)))
							}
						}
					}
				}
			}

			if(opt.getContent === true){
				// Apply transforms
				if('postDomTransform' in opt){
					opt.postDomTransform(window)
				}
				let str = `<!DOCTYPE HTML>${window.document.documentElement.outerHTML}`
				if('postStringTransform' in opt){
					str = opt.postStringTransform(str)
				}
				output.content = str
			}
			
			cb(false, output)

		}
	})
}



function removeDomain(link){
	// If no domain
	if(link.indexOf('http') !== 0) return link

	// Remove domain
	link = url.parse(link)
	return link.pathname
}



module.exports = scrapePage
