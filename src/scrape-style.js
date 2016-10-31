'use strict'
const request = require('request')

function scrapeStyle(url, cb){
	request.get(url, (err, res, body) => {
		if(err) cb(err)
		if(res.statusCode === 200){
			cb(false, body)
		}
	})
}

module.exports = scrapeStyle