'use strict'
const fs = require('fs-extra')
const request = require('request')
const scrapePage = require('./src/scrape-page')
const scrapeStyle = require('./src/scrape-style')

const defaultOptions = {
	getLinks: true,
	getStyles: true,
	getScripts: true,
	getImages: true,
	verbose: true,
	relativeLinks: true,
	method: 'dom',
	downloadPath: './download',
	filter: () => true
}


function websiteScraper(urls, opt, cb){

	// Find options
	if(typeof opt === 'function'){
		cb = opt
		opt = {}
	}
	if(typeof urls === 'string'){
		opt.urls = [urls]
	}
	else if(Array.isArray(urls)){
		opt.urls = urls
	}
	else{
		opt = urls
	}

	let i
	for(i in defaultOptions){
		if(!(i in opt)){
			opt[i] = defaultOptions[i]
		}
	}

	const queue = {
		links: opt.urls.slice(0),
		scripts: [],
		styles: [],
		images: []
	}

	downloadPages(queue, 0, opt, err => {
		if(err) return cb(err)
		downloadStyles(queue, 0, opt, err => {
			if(err) return cb(err)
			downloadScripts(queue, 0, opt, err => {
				if(err) return cb(err)
				downloadImages(queue, 0, opt, err => {
					if(err) return cb(err)
					cb()
				})
			})
		})
	})

}


function downloadPages(queue, progress, opt, cb){
	if(progress >= queue.links.length){
		return cb()
	}
	if(opt.verbose === true){
		console.log(`Pages: ${progress + 1}/${queue.links.length}`)
		console.log(`Downloading page: ${queue.links[progress]}`)
	}
	scrapePage(queue.links[progress], opt, (err, obj) => {
		if(err) return cb(err)
		addQueue(queue.links, obj.links)
		addQueue(queue.styles, obj.styles)
		addQueue(queue.scripts, obj.scripts)
		addQueue(queue.images, obj.images)
		let path = decodeURIComponent(`${opt.downloadPath}/${localizeLink(queue.links[progress])}`)
		fs.outputFile(path, obj.content, err => {
			if(err) return cb(err)
			if(opt.verbose === true){
				console.log(`Downloaded page to: ${path}`)
			}
			// Progress
			downloadPages(queue, progress + 1, opt, cb)
		})

	})
}

function downloadStyles(queue, progress, opt, cb){
	if(progress >= queue.styles.length){
		return cb()
	}
	if(opt.verbose === true){
		console.log(`Styles: ${progress + 1}/${queue.links.length}`)
		console.log(`Downloading style: ${queue.styles[progress]}`)
	}
	scrapeStyle(queue.styles[progress], opt, (err, obj) => {
		if(err) return cb(err)
		addQueue(queue.images, obj.urls)
		let path = decodeURIComponent(`${opt.downloadPath}/${localizeLink(queue.styles[progress])}`)
		fs.outputFile(path, obj.content, err => {
			if(err) return cb(err)
			if(opt.verbose === true){
				console.log(`Downloaded style to: ${path}`)
			}
			// Progress
			downloadStyles(queue, progress + 1, opt, cb)
		})

	})
}


function downloadScripts(queue, progress, opt, cb){
	if(progress >= queue.scripts.length){
		return cb()
	}
	if(opt.verbose === true){
		console.log(`Scripts: ${progress + 1}/${queue.scripts.length}`)
		console.log(`Downloading script: ${queue.scripts[progress]}`)
	}

	let path = decodeURIComponent(`${opt.downloadPath}/${localizeLink(queue.scripts[progress])}`)
	downloadFile(queue.scripts[progress], path, err => {
		if(err){
			console.log(err)
			cb()
		}
		if(opt.verbose === true){
			console.log(`Downloaded script to: ${path}`)
		}
		// Progress
		downloadScripts(queue, progress + 1, opt, cb)
	})

}

function downloadImages(queue, progress, opt, cb){
	if(progress >= queue.images.length){
		return cb()
	}
	if(opt.verbose === true){
		console.log(`Images: ${progress + 1}/${queue.images.length}`)
		console.log(`Downloading image: ${queue.images[progress]}`)
	}
	let path = decodeURIComponent(`${opt.downloadPath}/${localizeLink(queue.images[progress])}`)
	downloadFile(queue.images[progress], path, err => {
		if(err){
			console.log(err)
			cb()
		}
		if(opt.verbose === true){
			console.log(`Downloaded image to: ${path}`)
		}
		// Progress
		downloadImages(queue, progress + 1, opt, cb)
	})
}


function localizeLink(link){
	// Remove domain
	link = link.split('//')[1].split('/')
	link.shift()

	// Create index file
	if(link[link.length - 1].indexOf('.') === -1){
		link.push('index.html')
	}

	link = link.join('/')
	link = link.split('?')[0]
	link = link.split('#')[0]

	return link
}

function addQueue(addTo, addFrom){
	if(addFrom){
		let i
		for(i = addFrom.length; i--;){
			if(addTo.indexOf(addFrom[i]) === -1){
				addTo.push(addFrom[i])
			}
		}
	}
}


function downloadFile(url, dest, cb) {
	let path = dest.split('/')
	path.pop()
	path = path.join('/')
	fs.ensureDir(path, err => {
		if(err) return cb(err)

		const file = fs.createWriteStream(dest)
		const sendReq = request.get(url)
		sendReq.on('response', res => {
			if(res.statusCode !== 200) {
				return cb(`Response status was ${res.statusCode}`)
			}
		})
		sendReq.on('error', err => {
			fs.unlink(dest)
			return cb(err.message)
		})
		sendReq.pipe(file)
		file.on('finish', () => {
			file.close(cb)
		})
		file.on('error', err => {
			fs.unlink(dest)
			return cb(err.message)
		})
	})
}


module.exports = websiteScraper

























