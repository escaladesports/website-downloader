'use strict'
// Creates a relative link for targetPage to be inserted into currentPage
module.exports = function(currentPage, targetPage){
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

	if(currentPage) currentPage = `${currentPage}/`

	return `${currentPage}${targetPage}`
}