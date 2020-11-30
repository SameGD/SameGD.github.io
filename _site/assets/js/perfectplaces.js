//Documentation for Places API
//https://developers.google.com/maps/documentation/javascript/places

let resultsElem = document.getElementById("results");
let placeResults;
let userPosition;
let map;
let item = 0;
const moreButton = document.getElementById("more");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

function getLocation() {

  //Checks to see if geolocation is available on users browser

  if (window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationError);
  }
  else {
    getLocationError();
  }
}

function getLocationSuccess(pos) {
  getPlaces(pos);
}

function getLocationError(err) {
  resultsElem.innerHTML = "It's gonna be pretty hard to find places near you if you don't enable geolocation tbh.";
}

function getPlaces(pos) {

  userPosition = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
  
  map = new google.maps.Map(document.getElementById('map'), {
    center: userPosition,
    zoom: 15
  });
  
  //Can also specify keyword, name, openNow, and type.

  console.log(document.getElementById("radius").value);
  console.log(document.getElementById("keyword").value);
  console.log(document.getElementById("open").checked);
  
  var request = {
    location: userPosition,
    radius: document.getElementById("radius").value,
    keyword: document.getElementById("keyword").value,
    openNow: document.getElementById("open").checked,
  };

  var service = new google.maps.places.PlacesService(map);
  let getNextPage;
  
  service.nearbySearch(request, callback);

}
moreButton.onclick = function () {
  moreButton.disabled = true;

  if (getNextPage) {
    getNextPage();
  }
}


function callback(results, status, pagination) {

  if (status == google.maps.places.PlacesServiceStatus.OK) {
    
     moreButton.disabled = !pagination.hasNextPage;

      if (pagination.hasNextPage) {
        getNextPage = pagination.nextPage;
      }
    
    console.log(results);
    shuffleArray(results);
    placeResults = results;
    
    updateCard();
    
    document.getElementById("settings").classList.add("is-hidden");
    document.getElementById("placeCard").classList.remove("is-hidden");

  }
}

function previousItem() {
  if (item > 0) {
    item -= 1;
  }
  updateCard();
}

function nextItem() {
  if (item < placeResults.length - 1) {
    item += 1;
  }
  updateCard();
}

function updateCard() {
  map.setCenter(placeResults[item].geometry.location);
  document.getElementById("placeName").innerHTML = placeResults[item].name;
  document.getElementById("placeLocation").innerHTML = placeResults[item].vicinity;
}
