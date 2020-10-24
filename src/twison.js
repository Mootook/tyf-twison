const choiceRegexp = /\[\[.+?\]\]/g
const choiceSyntaxRegExp = /\[\[(.*?)\-\&gt;(.*?)\]\]/
var Twison = {

	/**
	 *
	 * @param {String} text
	 */
	extractLinksFromText: function (text) {
	  var links = text.match(choiceRegexp)
		if (links) {
			return links.map(function(link) {
				var differentName = link.match(choiceSyntaxRegExp);
				if (differentName) {
					return {
						name: differentName[1],
						link: differentName[2]
					};
				} else {
					link = link.substring(2, link.length-2)
					return {
						name: link,
						link: link
					}
				}
			});
		}
	},

	/**
	 *
	 * @param {String} text
	 */
	filterText: function (text) {
		let retVal = text
		const links = text.match(choiceRegexp) 
		if (links) {
			links.forEach(choice => {
				retVal = retVal.replace(choice, '')
			})
		}
		if (retVal.endsWith('\n')) {
			retVal = retVal.split(" ").filter((k, i, arr) => i !== arr.length - 1).join(' ')
		}
		return retVal.trim()
	},

	/**
	 *
	 * @param {Object} dict
	 */
	arrangeKeys: function (dict) {
		const retVal = {}
		const orderedKeys = ['pid', 'name', 'text', 'tags', 'auto_link', 'links']
		orderedKeys.forEach(k => {
			if (dict[k]) {
				retVal[k] = dict[k]
			}
		})
		return retVal
	},

	/**
	 *
	 * @param {*} passage
	 */
	convertPassage: function (passage) {
		var text = passage.innerHTML
		const dict = {}
		var linkMatch = text.match(choiceRegexp)
		if (linkMatch) {
			dict.links = linkMatch
			.filter(l => {
				const diffName = l.match(choiceSyntaxRegExp)
				if (diffName) return true
				else {
					dict["auto_link"] = l.substring(2, l.length-2)
					return false
					}
				})
			.map(l => {
				const k = l.match(choiceSyntaxRegExp)
				return { name: k[1], link: k[2] }
			})
		}
		if (!dict.links || !dict.links.length) {
			delete dict.links
		}
		const dataArr = ['name', 'pid', 'position', 'tags']
		dataArr.forEach(attr => {
			const value = passage.attributes[attr].value
			if (!value) return
			dict[attr] = value
		})

		if (dict.tags) {
			dict.tags = dict.tags.split(" ");
		}
		dict.text = Twison.filterText(text)
		return Twison.arrangeKeys(dict)
	},

	/**
	 *
	 * @param {*} story
	 */
	convertStory: function(story) {
		var passages = story.getElementsByTagName("tw-passagedata")
		var convertedPassages = Array.prototype.slice.call(passages).map(Twison.convertPassage)

		var dict = {
			passages: convertedPassages
		};

		["name", "startnode", "ifid"].forEach(function(attr) {
			var value = story.attributes[attr].value
			if (value) {
				dict[attr] = value
			}
		})

		// Add PIDs to links
		var pidsByName = {};
		dict.passages.forEach(passage => {
			pidsByName[passage.name] = passage.pid
		})

		dict.passages.forEach(passage => {
			if (passage["auto_link"]) {
				passage["auto_link"] = pidsByName[passage["auto_link"]]
			}
			if (!passage.links) return;
			passage.links.forEach(function(link) {
				link.pid = pidsByName[link.link];
				if (!link.pid) {
					link.broken = true;
				}
			})
		})
		dict.visited = false
		return dict
	},

	/**
	 *
	 */
	convert: function() {
		var storyData = document.getElementsByTagName("tw-storydata")[0];
		var json = JSON.stringify(Twison.convertStory(storyData), null, 2);
		document.getElementById("output").innerHTML = json 
	}
}
window.Twison = Twison;