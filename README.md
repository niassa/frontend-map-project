## Front-end Nanodegree Neighborhood Map Project

The purpose of this project is to develop a single page application featuring a map of my neighborhood with added functionality to this map including highlighted locations, third-party data about those locations, and various ways to browse the content.  

As I am also a published author, I wanted to make this project something that could be useful on my own personal website. A list of metro-area bookstores, broken down by type, could be useful, so that is what I chose for my project. I ran a google search of bookstores in the Denver metro area, and pulled the first 30 records I found. Two were removed from my final compiled list as they have gone out of business. 

This app utilizes Google Maps API, Google Street View API, and Foursquare API. It also incorporates the JavaScript library [Knockout](http://knockoutjs.com).

### Using This App
Launch the index.html. The page will initially load all of the listed bookstores. 
* Along the top of the page, you will find a list of categories.
* On the left side of the page, beneath the categories, you will find a list of bookstores.
    * Above this list is a text box where you can search for a bookstore by name.
    * Above the list, and below the text box, is a button which will clear the filter so you do not have to manually clear the text box.
* On the right side of the page, beneath the categories, you will find an interactive map (provided by Google Maps).

#### Filtering Content
You can filter what bookstores are shown in both the list on the left and on the map. There are two ways to filter:
* **Filter by category**: select one of the category options from the top of the screen
* **Filter by name**: type in the name (or part of the name) of the bookstore in the text input box

You can also clear the filtered content: 
* **Clear filtered content**: select the Clear Filter button

#### Viewing Map Information
All of the bookstores meeting the filter criteria (or lack thereof) will populate on the map with standard Google markers. When selecting a bookstore from the list on the left, the associated marker will bounce on the map, and an InfoWindow will open up providing more information about the bookstore.

Alternatively, you can click directly on the map marker itself to pull up its associated bookstore information.

This bookstore information includes information pulled from Foursquare, as well as a Google Street View image of the location. 

_Please note: The majority of Street View images are pulled from latitude and longitude, and do not always show the best image of the location._

### Known Issues
* In mobile view, when selecting the Menu for the filter categories, you must select the `Menu` option a second time to close the menu. 
    * The filter categories menu does _not_ cover the map, but it does cover the bookstore list of results.
* The category does not highlight when selected. This was something I was able to achieve perfectly using jQuery, but for this project, we were asked not to use jQuery. I tried everything to find a way to bind the properties to a knockout function and could not make it work for this iteration. _For more information on this, please see the inline notes in `myApp.js`._

### Special Thanks
Special thanks go to the members of the Udacity community for helping when I was stuck (all but one of my issues were resolved). I would also like to make a list of the sites that I used to help me figure out specific issues as I was faced with them:
* **[Knockout Documentation](http://knockoutjs.com)** -- I read over this site so many times I wouldn't be surprised if I don't have half of it memorizes at this point.
* **[Google API Documentation](https://developers.google.com/maps/documentation/)** -- So very much information here to parse out and extract what I needed. But it was well-organized and easy to follow.
* **[Foursquare API Documentation](https://developer.foursquare.com/docs)** -- While much of this information was more than I needed to complete the project, it was good to have on-hand as a reference guide. I did refer to it a couple of times when I got stuck.
* **[jQuery Documentation \(for getJSON\)](http://api.jquery.com/jquery.getjson/)** -- Needed a solution for loading the Foursquare API, and my internet research showed me a solution of the jQuery command of getJSON. The documentation proved very helpful, especially for error handling.
* **[Udacity Forums](http://discussions.udacity.com)** -- While the forums are very slow these days, I was able to search to see if others had similar questions and use that to work on my code. I also did have a couple of questions of my own.
* **[Stack Overflow](http://stackoverflow.com)** -- This is a virtual gold mine of information. Sometimes it's difficult to weed through the arbitrary info, but the pros far outweigh the cons.
* **[CSS Button Generator](http://css3buttongenerator.com)** -- I used this site to generate a nice CSS3 button for the Clear Filter button.
* **[Google](http://www.google.com)** -- When in doubt, Google is my best bet for tracking down the information I need.


