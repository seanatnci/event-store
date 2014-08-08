var map = "";
var geocoder;
var start="";
var eventLoc;
var directionsDisplay;
var myLat;
var myLong;


  /*
   var useragent = navigator.userAgent;
  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = '100%';
    mapdiv.style.height = '100%';
  } else {
    mapdiv.style.width = '100%';
    mapdiv.style.height = '800px';
  }
*/
$(window).bind("load", function() {

  if (google == undefined) {
    alert('google unavailable please try again');
    return;
    }
  if (navigator.geolocation)
    {
    console.log("geo position available");

    directionsService = new google.maps.DirectionsService();
    google.maps.visualRefresh = true;

    $('#third').on("pageshow", function() {
                $('#mapcanvas').gmap('refresh');
        });
    }
    else{
       document.getElementById("mapcanvas").innerHTML="<p>Geolocation is not supported by this browser.</p>";
       return;
    }
    $('#locateEvent').click(function (e) {
                   findMyLocation();
            });
});

function setEventLocation(loc){
    eventLoc=loc;
}
function findMyLocation() {
  /*$("#mapcanvas").gmap('clear', 'markers');*/
   navigator.geolocation.getCurrentPosition(success, error, {timeout:10000});
}

function success(position) {

  myLat = position.coords.latitude;
  myLong = position.coords.longitude;

  var latlng = new google.maps.LatLng(myLat, myLong);
  geocoder = new google.maps.Geocoder();
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        start=results[1].formatted_address;
        map = $('#mapcanvas').gmap('get', 'map');
        $('#mapcanvas').gmap('option', 'zoom', 13);
        $("#mapcanvas").gmap('clear','markers');
        directionsDisplay = new google.maps.DirectionsRenderer({
                'map': map,
                'preserveViewport': true,
                'draggable': false
        });
        directionsDisplay.setPanel(document.getElementById("directions_panel"));
        google.maps.event.trigger(map, 'resize');
        /*eventLoc = map.getCenter();*/
        calcRoute(directionsDisplay,eventLoc);
        $('#locateEvent').hide();
        /*$('#mapcanvas').gmap({ 'center' : new google.maps.LatLng(myLat, myLong), 'zoom': 10,'disableDefaultUI':true,
                       'callback': function() {
						var self = this;
						self.addMarker({'position': this.get('map').getCenter() }).click(function() {
							self.openInfoWindow({ 'content': 'My Location' }, this);
						});

                    }});*/
      }
     else {
      alert('Geocoder failed due to: ' + status);
    }
  });
}

function calcRoute(directorsDisplay,end) {

    var request = {
      origin:start,
      destination:decodeURI(end),
      travelMode: google.maps.DirectionsTravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directorsDisplay.setDirections(response);
    }
      else { alert ("No Directions Found")
    }

    map.fitBounds(directorsDisplay.getDirections().routes[0].bounds);

  });
}

function error(msg) {
  var s = document.querySelector('#status');
  s.innerHTML = typeof msg == 'string' ? msg : "failed";
  s.className = 'fail';
  
  console.log(arguments);
}



