'use strict'
// Validates links
module.exports = function(link, opt){
	if(
		link &&
		link.indexOf('http') === 0 &&
		( !('filter' in opt) || opt.filter(link) )
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