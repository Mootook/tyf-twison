# Twison-TYF

Forked from [LazyWalker](https://github.com/lazerwalker/twison).

The goal of this project was to create an easy, quick way to write and edit dialogue for complex video game dialogue trees.  

Twison-TYF is just one half of that project (other half to be released soon).
The purpose of Twison-TYF was to configure an existing twee parser for some flexibility to suit my own needs. I wanted a way to be able to write in the twee syntax while also adding in some custom functionality when the raw file runs through a game engine (configured for Godot in this case).

## Installation and Setup

While [LazyWalker's](https://github.com/lazerwalker/twison) original repository uses Twine's GUI, this fork is a CLI usage that pairs with Tweego (a command line Twine compiler).  

1. `git clone https://github.com/Mootook/tyf-twison.git; cd tyf-twison`

2. [Download Tweego](https://www.motoslave.net/tweego/)

Tweego's installation adds a `story-formats` directory as `TWEEGO_PATH`, which contains a few default formatters. We'll be adding our custom formatter here.

3. `npm install; npm start`

`npm start` will start [watch.js](watch.js) which will watch for any changes to the src directory and trigger [build.js](build.js). The build file minimizes [twison.js](src/twison.js) and stores it into tweego's `story-formats` directory as `tyf`.

And that should be it. Making changes to how tyf-twison parses can all be done by modifying [twison.js](src/twison.js).

## Usage

[Twee Documentation](https://dan-q.github.io/twee2/documentation.html)

Tweego accepts `.tw/.twee` files.

Here is a basic `.tw` file:
```tw
:: StoryData
{
	"ifid": "D674C58C-DEFA-4F70-B7A2-27742230C0FC",
	"format-version": "2.28.2"
}

::StoryTitle
{Story Title}

::Start
This is the start of our story
[[node_1]]

::node_1
This one will link to the next node. The option is the same as the node's title, and it will not be a visible choice for the user. Dialogue UI will simply wait for user input to proceed. [[node_2]]

::node_2
Now let's try some choices 
[[First choice->node_3]]
[[Branching choice->node_branch]]

::node_branch
A branching choice.
[[node_3]]

::node_3 [tags]
It's converted as an auto_link, since it's the only option but requires user input to proceed
Another cool thing this had been configured for is
<<a_callback>>
<<a_callback args>>
```
The callbacks will be explained more in-depth in the Godot Dialogue Repo.

Now run `tweego -f tyf -o {name}.html {name}.tw`, where tyf is the formatter, and {name}.tw is the twee file you've created.

This will translate to:
```json
{
  "passages": [
    {
      "pid": "1",
      "name": "Start",
      "text": "This is the start of our story",
      "auto_link": "2"
    },
    {
      "pid": "2",
      "name": "node_1",
      "text": "This one will link to the next node. The option is the same as the node's title, and it will not be a visible choice for the user. Dialogue UI will simply wait for user input to proceed.",
      "auto_link": "3"
    },
    {
      "pid": "3",
      "name": "node_2",
      "text": "Now let's try some choices",
      "links": [
        {
          "name": "First choice",
          "link": "node_3",
          "pid": "5"
        },
        {
          "name": "Branching choice",
          "link": "node_branch",
          "pid": "4"
        }
      ]
    },
    {
      "pid": "4",
      "name": "node_branch",
      "text": "A branching",
      "auto_link": "5"
    },
    {
      "pid": "5",
      "name": "node_3",
      "text": "It's converted as an auto_link, since it's the only option but requires user input to proceed\nAnother cool thing this had been configured for is\n<<a_callback>>\n<<a_callback args>>",
      "tags": [
        "tags"
      ]
    }
  ],
  "name": "{Story Title}",
  "startnode": "1",
  "ifid": "D674C58C-DEFA-4F70-B7A2-27742230C0FC",
  "visited": false
}
``` 
Note: callbacks and `visited` will be explained more when the Godot counterpart to this repo is made public TBD.

All of these parameters are flexible and just about anything is possible with this parsing system (despite this own version's limitations and problems). 