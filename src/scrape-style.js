'use strict'
const path = require('path')
const request = require('request')
const checkLink = require('./validate')

// Regex for getting CSS urls
const regUrls = /url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\)/gi
const regQuotes = /('|")/g

function scrapeStyle(url, opt, cb){
	request.get(url, (err, res, body) => {
		if(err) cb(err)
		if(res.statusCode === 200){

			const output = {
				content: body,
				urls: []
			}


			const domain = getDomain(url)
			const domainPath = getDomainPath(url)
			let sanitizedUrl
			let urls = body.match(regUrls)
			let i
			for(i = urls.length; i--;){
				sanitizedUrl = getPath(urls[i])
				// If relative
				if(sanitizedUrl.indexOf('http') !== 0){
					if(sanitizedUrl[0] === '/'){
						sanitizedUrl = domain + sanitizedUrl
					}
					else{
						sanitizedUrl = `${domainPath}/${sanitizedUrl}`
					}
				}



				if(checkLink(sanitizedUrl, opt)){
					// Relative-ize link
					if(opt.relativeLinks === true){
						output.content = output.content.replace(urls[i], `url("${path.relative(url, sanitizedUrl)}")`)
					}
					output.urls.push(sanitizedUrl)
				}
			}


			cb(false, output)

		}
	})
}


function getPath(cssUrl){
	return cssUrl
		.replace('url(', '')
		.replace(')', '')
		.replace(regQuotes, '')
}

function getDomain(url){
	url = url.split('/')
	return `${url[0]}//${url[2]}`
}
function getDomainPath(url){
	url = url.split('/')
	url.pop()
	url = url.join('/')
	return url
}



module.exports = scrapeStyle