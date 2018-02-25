/* ----- Model ----- */
// I prefer to get and set all global variables right off the bat, even if they're placeholders for later.

// Google Maps variables needed for Google Maps API
var googleMapsAPIKey = 'AIzaSyC-Dviv1NRrCTrwrYKCX8oRFlsFHtHZGPo';

// Google Street View variable containing beginning URL
var googleSVURL = 'https://maps.googleapis.com/maps/api/streetview';

// Map variable and lat/lng used to set the center of the map on load
var map;
var centerLat = 39.7392358;
var centerLng = -104.990251;

// Get and set date for Foursquare's version in URL:
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1;
var yyyy = today.getFullYear();

// Need to set the date standards to have a zero before any single-digit entries for day and month
if (dd < 10) {
    dd = '0' + dd;
}
if (mm < 10) {
    mm = '0' + mm;
}

var version = yyyy + mm + dd;

// Foursquare variables needed for Foursquare API
var foursquareCID = 'U01MV3QZTBA4KBUTEZZHJLLRLFESIEW1NLTMS25T0NTHRECR';
var foursquareSecret = '2YGSGTO1ZFXPMNBFJAFJI0BW5XZF2I3XXCTDQ1D4ODQVUQRP';
var foursquareAPI = 'https://api.foursquare.com/v2/venues/search?client_id=' + foursquareCID +
    '&client_secret=' + foursquareSecret + '&v=' + version;



/* ----- Function to Alphabetize the allBookstores Array -----*/
// found a version of this code on W3Schools; adapted for use here

// All bookstore data is hosted in bookstores.js in the variable `allBookstores`

function alphaName() {
    allBookstores.sort(function(a, b){
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        if (x < y) {return -1;}
        if (x > y) {return 1;}
        return 0;
    });
}

// Run the alphabetize function --- by initially setting the alphabetization, later on, all versions of the booklist will be alphabetized, as well.
alphaName();


// Function to gather and name all of the data for each bookstore
var Place = function(data){
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.location.lat);
    this.lng = ko.observable(data.location.lng);
    this.type = ko.observable(data.type);
    this.marker = ko.observable();
};

/* ----- View Model (aka Octopus) ----- */
var viewModel = function () {
	// By creating a variable named `self` equal to `this`, we state that `self` inside this function is referring to the `viewModel` as a whole
    var self = this;

    // Setting the placeholder variable for the Map marker
    var marker;

    // Creating an empty observableArray of bookstores in order to hold the information for placing markers on the map and create InfoWindows
    self.bookstoreList = ko.observableArray([]);

    // I need another array for what will become the list of bookstores in the DOM. This array is what will be called for any filtering done.
    self.visibleBS = ko.observableArray();

    // Using the array `allBookstores` from bookstores.js, I'm pushing the information into the placeholder `self.bookstoreList` observableArray with the newly created Place objects for each.

    // I put the bookstores into the separate js file to make it easier to deal with the information. If I were to have someone else needing to update my list of bookstores, I wouldn't want them to accidentally mess up any of the major code, so keeping the list in a separate js file seemed to make the most sense here.
    allBookstores.forEach(function(bookstore){
        self.bookstoreList.push( new Place(bookstore) );
    });

    
    // Received help online for making the Map InfoWindow open only one at a time: https://stackoverflow.com/questions/24951991/open-only-one-infowindow-at-a-time-google-maps
    var bsInfoWindow = new google.maps.InfoWindow({
        maxWidth: 275,
    });

    // Run a forEach function on the bookstoreList to set the markers and InfoWindows
    self.bookstoreList().forEach(function(bookstore) {

        // The below sets the marker itself
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(bookstore.lat(), bookstore.lng()),
            map: map,
            animation: google.maps.Animation.DROP
        });
        bookstore.marker = marker;

        // Concatenate the Foursquare API URL (found this URL by selecting a place on the Foursquare website and breaking apart the URL for what was needed):
        var foursquareURL =  foursquareAPI + '&ll=' + bookstore.lat() + ',' + bookstore.lng() +  '&query=\'' + encodeURIComponent(bookstore.name()) + '\'' +
            '&limit=1';

        // Set/Declare the variables necessary to construct the Foursquare API information
        var foursquareResponse = '';
        var googleSVImage = '';
        var foursquareSuccess = false;
        var drivingDirs = '<a href="https://www.google.com/maps/dir/Current+Location/' +
            bookstore.lat() + ',' + bookstore.lng() +
            '" target="_blank" title="Driving Directions"><span class="fas fa-car mt-2 mb-2"></span></a>';
        var foursquareAttr = '';

        // Use JSON for the Foursquare URL load:
        $.getJSON( foursquareURL, function(response) {
        	//Setup all variables at the beginning of the function (to make it easier to find the vars and var names as a reference for later)

        	// Based on looking at the console for what the response is, I see we really only need the first response. Using an array index of `[0]` makes it easy to set the variable for the `bsInfo`
            var bsInfo = response.response.venues[0];
            var bsInfoAddress = '';
            var bsInfoStreet = '';
            var bsInfoCity = '';
            var bsInfoState = '';
            var bsInfoZip = '';
            var bsInfoPhone = '';
            var bsInfoLat = '';
            var bsInfoLng = '';

            bsInfoStreet = bsInfo.location.address;
            bsInfoCity = bsInfo.location.city;
            bsInfoState = bsInfo.location.state;
            bsInfoZip = bsInfo.location.postalCode;
            bsInfoPhone = bsInfo.contact.formattedPhone;
            bsInfoLat = bsInfo.location.lat;
            bsInfoLng = bsInfo.location.lng;

            // If Foursquare doesn't have the lat/lng for the bookstore, use the default provided in the original object array found in bookstores.js
            if (bsInfoLat === undefined) {
                bsInfoLat = bookstore.lat();
            }
            if (bsInfoLng === undefined) {
                bsInfoLng = bookstore.lng();
            }

            // I've found that Foursquare has a lot of incomplete information. This is not very user-friendly for this map project. In the cases where Foursquare is missing information, rather than have it display "undefined," I've set some text to let the user know the information could not be found. Help acquired online: https://developer.foursquare.com/docs/api/venues/details
            if ((bsInfoStreet !== undefined) && (bsInfoCity !== undefined) && (bsInfoState !== undefined) && (bsInfoZip !== undefined)) {
                bsInfoAddress = bsInfoStreet + '<br>' + bsInfoCity + ', ' + bsInfoState + ' ' + bsInfoZip;
            }
            else {
                bsInfoAddress = 'Book store address missing information or not found.';
            }

            // Same as above, except for phone number
            if (bsInfoPhone === undefined) {
                bsInfoPhone = 'Book store phone number was not found.';
            }


            // Now that we have populated all of our variables, we can concatenate them into a string to display in the InfoWindow
            foursquareResponse = bsInfoAddress + '<br>' +
                bsInfoPhone + drivingDirs + '<br>';

            
            // If Google Street View has information based on the lat/lng info, provide that here:
            var googleSVMetadataURL = googleSVURL + '/metadata?location=' +
                bsInfoLat + ',' + bsInfoLng + '&key=' + googleMapsAPIKey;

            //Similar to what I had to do above with the Foursquare API, I'm making the Google Street View JSON data call for the API.
            $.getJSON(googleSVMetadataURL, function(response) {
                // Set the variable for the metadata status
                var googleSVMetaStatus = response.status;
                

                // If the status is OK, add the image HTML to the `googleSVImage` variable to be placed into the InfoWindow with the Foursquare API information
                if (googleSVMetaStatus === 'OK') {
                    googleSVImage = '<p><img src="' + googleSVURL + '?' +
                        'location=' + bsInfoLat + ',' + bsInfoLng +
                        '&size=225x100&key=' + googleMapsAPIKey + '"></p>';
                }

                // Mark the `foursquareSuccess` variable to true, because the function ran properly.
                foursquareSuccess = true;
            })

            // Below is a list of error handling for Google Street View Metadata
            .done(function() {
                // console.log('Full Metadata Success: '+ bookstore.name());
            })

            .fail(function() {
                // console.log('Metadata Error: '+ bookstore.name());
                foursquareSuccess = false;
            })

            .always(function() {
                // console.log('All Metadata Complete: '+ bookstore.name());
            });

        })
		
		// Below is a list of error handling for Foursquare as a whole
        .done(function() {
            // console.log('Full Success: '+ bookstore.name());
        })

        .fail(function() {
            // If this fails, load a text string into the DOM for the InfoWindow letting the user know
            foursquareResponse = '<p>Data could not be retrieved from Foursquare.</p>';
            foursquareSuccess = false;
            // console.log('Full Error: '+ bookstore.name());
        })

        .always(function() {
            // console.log('Full Complete: '+ bookstore.name());
        });

        // Load all of the InfoWindow content
        google.maps.event.addListener(bookstore.marker,'click',function(){

            // If Foursquare was successful, then provide attribution of Foursquare's information
            if (foursquareSuccess) {
                foursquareAttr = '<small><em>Bookstore address and phone number were provided by <a href="https://foursquare.com" target="_blank">Foursquare</a></em>.</small>';
            }

            if (foursquareResponse === '') {
                foursquareResponse = drivingDirs;
            }

            // Concatenate all of the InfoWindow content into a variable named `infoWindowContent`
            var infoWindowContent = '<div>' + '<h4>' + bookstore.name() + ' <em><small>' + bookstore.type() + '</small></em></h4>' + googleSVImage + '<p>' + foursquareResponse + foursquareAttr + '</p>' + '</div>';

            // Set the animation of the marker to bounce when clicked or the bookstore is selected from the list, and also stops any others that are currently bouncing (in case someone clicks really quickly on a different bookstore)
            if (bookstore.marker.getAnimation() !== null) {
              bookstore.marker.setAnimation(null);
            } else {
              bookstore.marker.setAnimation(google.maps.Animation.BOUNCE);

              // Have to use a setTimeout function in order to stop the bouncing from happening constantly. I've set this to bounce for one full second (or 1000 milliseconds). Thanks to this Udacity forum post for helping me fix this issue: https://discussions.udacity.com/t/how-to-stop-marker-animation-when-the-other-one-is-clicked/229309
              setTimeout(function(){
                bookstore.marker.setAnimation(null);
              }, 1000);
            }

            // Set the content of the InfoWindow
            bsInfoWindow.setContent(infoWindowContent);

            // Open the InfoWindow attached to the marker
            bsInfoWindow.open(map, bookstore.marker);
        });

        // When one of the bookstores is selected from the list, the marker will show and bounce
        self.showBsInfo = function(bookstore) {
            google.maps.event.trigger(bookstore.marker, 'click');
        };

        // In order to filter the bookstores, we need to add the bookstore information to the `visibleBS` array. The filtering happens below in new functions.
        self.visibleBS.push(bookstore);
    });

    // A search box (text input in the DOM) is used to allow the user to filter bookstores by typing in the name of the bookstore they are looking for. I found this codepen to be particularly useful in figuring out how to make this work: https://codepen.io/prather-mcs/pen/KpjbNN?editors=001
    self.userInput = ko.observable('');

    // Function to run the actual filtering of content based on either clicking the type of bookstore or by typing in the name of a bookstore into the search box
    self.filterBookstores = function () {

        // Because case can be a factor, here we will convert everything to lower case for the sake of filtering
        var input = self.userInput().toLowerCase();

        // We need to remove all markers and then place only the ones that relate to the filtered list. Here, we remove them all.
        self.visibleBS.removeAll();

        // We also need to close any open InfoWindows.
        bsInfoWindow.close();

        // Add to the `visibleBS` array for each of the 'bookstoreList' array and set their markers to invisible
        self.bookstoreList().forEach(function (bookstore) {

        	// Hide any markers for bookstores that are no longer in the `visibleBS` array
            bookstore.marker.setVisible(false);
            if (bookstore.name().toLowerCase().indexOf(input) !== -1) {
                self.visibleBS.push(bookstore);
            }
        });

        // Now we can set the markers to be visible for all of the bookstores in the `visibleBS` array
        self.visibleBS().forEach(function (bookstore) {
            bookstore.marker.setVisible(true);
        });
    };

    // Function for filtering by the type of bookstore from the menu
    self.filterButton = function(type) {

    	// Easiest to remove all and start from scratch. Here we remove all items from the `visibleBS` array
        self.visibleBS.removeAll();

        // Closes any open InfoWindows
        bsInfoWindow.close();

        // Clears any text in the filter search box
        self.clearSearchBox();

        // Add to the `visibleBS` array for each of the 'bookstoreList' array and set their markers to invisible
        self.bookstoreList().forEach(function (bookstore) {
            bookstore.marker.setVisible(false);
            if (bookstore.type() === type) {
                self.visibleBS.push(bookstore);
            }
            else if (type === 'All') {
                self.visibleBS.push(bookstore);
            }
        });

        // Now we can set the markers to be visible for all of the bookstores in the `visibleBS` array
        self.visibleBS().forEach(function (bookstore) {
            bookstore.marker.setVisible(true);
        });

        /* I also wanted to use this function to be able to set the CSS of the "active" filter. I tried everything to make it work without using jQuery... I googled like mad, posted on the Udacity forums, asked questions on stackoverflow, etc., and I could not find a knockout.js solution. Since the rubric specifically stated not to use jQuery to manipulate the DOM, I've removed this code. I'm leaving it in here, commented out, in case you (as the reviewer) are willing/able to help me out with how I might be able to make this work as a knockout function. Things I've tried:
        	* adding an additional data-bind using a comma to set the css attribute: http://knockoutjs.com/documentation/css-binding.html
        	* creating an observableArray with the name, type, and css status, and running a forEach to remove the "active" class from all, and then add the "active" class to clicked item (aka target)
        	* using a Boolean for whether or not the option is active (as shown here: https://stackoverflow.com/questions/17970313/using-knockout-to-set-css-class-with-an-if-condition)
        	* trying to toggle the class (as shown here: https://stackoverflow.com/questions/23385937/knockout-toggle-active-class-on-click) 
    	Any/all help would be greatly appreciated, as I would really like to know how to make this work! It would also be great if I could incorporate the inline script from the HTML into this same function. I tried to find a way to make that work consistently, and failed there, too. Alas, I'm out of time and need to submit this project (my company, who is paying for my Nano Degree, has only given me until the end of the month to complete it). Thank you! */

        // var navClicked = $(event.target);

    	// function setActive(elem) {
	    // 	for (var u=0; u < elem.length; u++) {
	    // 		if (elem.hasClass("active")) {
	    // 			elem.removeClass("active")
	    // 		}
	    // 	}
	    // 	$(event.target).addClass("active");
    	// }
    	// setActive($('#myTopnav').children());
    	// setActive($('#myMobileNav').children());

    	// // //hide Menu toggle
    	// // $('.mobile-nav').toggle("display");
    	// function myFunction(elem) {
    	// 	if (elem.hasClass("responsive")) {
    	// 		elem.removeClass("responsive");
    	// 	}
    	// }
    	// var x = $('#myMobileNav');
    	// myFunction(x);
  
    	// console.log($('#myTopnav').children());

    };

   	// Resets the search box to an empty string, which thus defaults it to its default text (set in the actual DOM)
    self.clearSearchBox = function () {
        self.userInput('');
    };

    // Reset everything filter-related: search box, info windows, markers, etc.
    self.clearFilter = function(){

        // Clears the text from the text input (function above)
        self.clearSearchBox();

        // Removes all bookstores from the `visibleBS` array
        self.visibleBS.removeAll();

        // Closes any open InfoWindows
        bsInfoWindow.close();

        // Resets the data back to the default of showing all bookstores (makes all visible in the list and all markers visible)
        self.bookstoreList().forEach(function (bookstore) {
            bookstore.marker.setVisible(true);
            self.visibleBS.push(bookstore);
        });

    };

};

/* ----- View ----- */
// First, we must initialize the map itself
function initMap() {
    'use strict';

    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(centerLat, centerLng),
        zoom: 10,
        zoomControl: true,
        scaleControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            mapTypeIds: ['roadmap', 'terrain' , 'hybrid' , 'satellite']
        }
    });

    // Keep map centered on window resize, had to research the best way to do this online: https://stackoverflow.com/questions/8792676/center-google-maps-v3-on-browser-resize-responsive
    google.maps.event.addDomListener(window, 'resize', function() {

    	// Variable sets the defined center of the map
        var center = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
    });

    ko.applyBindings(new viewModel());
}

function googleAPIError() {
    alert("Google Maps could not load. Please check your internet connection and try again.");
}
