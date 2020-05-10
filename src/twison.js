const choiceRegexp = /\[\[.+?\]\]/g
const choiceSyntaxRegExp = /\[\[(.*?)\-\&gt;(.*?)\]\]/
var Twison = {
  extractLinksFromText: function (text) {
    var links = text.match(choiceRegexp)
    if (links) {
      return links.map(function(link) {
				var differentName = link.match(choiceSyntaxRegExp);
        if (differentName) {
          // [[name->link]]
          return {
            name: differentName[1],
            link: differentName[2]
          };
        } else {
          // [[link]]
          link = link.substring(2, link.length-2)
          return {
            name: link,
            link: link
          }
        }
      });
    }
	},
	
	filterText: function (text) {
		let retVal = text
		const choices = text.match(choiceRegexp) 
		if (choices) {
			choices.forEach(choice => {
				retVal = retVal.replace(choice, '')
			})
		}
		if (retVal.endsWith('\n')) {
			retVal = retVal.split(" ").filter((k, i, arr) => i !== arr.length - 1).join(' ')
		}
		return retVal.trim()
	},

	arrangeKeys: function (dict) {
		const retVal = {}
		const orderedKeys = ['pid', 'name', 'text', 'links']
		orderedKeys.forEach(k => {
			if (dict[k]) {
				retVal[k] = dict[k]
			}
		})
		return retVal
	},

  convertPassage: function (passage) {
		var text = passage.innerHTML
  	const dict = {}
    var links = Twison.extractLinksFromText(text);
    if (links) {
      dict.links = links
    }
    ["name", "pid", "position", "tags"].forEach(function(attr) {
      var value = passage.attributes[attr].value;
      if (value) {
        dict[attr] = value;
      }
    });

    if (dict.tags) {
      dict.tags = dict.tags.split(" ");
		}
		dict.text = Twison.filterText(text)
    return Twison.arrangeKeys(dict)
	},

  convertStory: function(story) {
    var passages = story.getElementsByTagName("tw-passagedata");
    var convertedPassages = Array.prototype.slice.call(passages).map(Twison.convertPassage);

    var dict = {
      passages: convertedPassages
    };

    ["name", "startnode", "ifid"].forEach(function(attr) {
      var value = story.attributes[attr].value;
      if (value) {
        dict[attr] = value;
      }
    });

    // Add PIDs to links
    var pidsByName = {};
    dict.passages.forEach(function(passage) {
      pidsByName[passage.name] = passage.pid;
    });

    dict.passages.forEach(function(passage) {
      if (!passage.links) return;
      passage.links.forEach(function(link) {
        link.pid = pidsByName[link.link];
        if (!link.pid) {
          link.broken = true;
        }
      });
    });

		dict.visited = false
    return dict;
  },

  convert: function() {
    var storyData = document.getElementsByTagName("tw-storydata")[0];
    var json = JSON.stringify(Twison.convertStory(storyData), null, 2);
    document.getElementById("output").innerHTML = json 
  }
}
window.Twison = Twison;