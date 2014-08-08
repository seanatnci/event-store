/**
 * Created by PyCharm.
 * User: sean
 * Date: 04/01/12
 * Time: 21:11
 * To change this template use File | Settings | File Templates.
 */
var db = null;
var listing;
var events = {};
events.webdb = {};

events.webdb.onError = function(tx, e) {
  alert('Something unexpected happened: ' + e.message );
}

events.webdb.onSuccess = function(tx, r) {
  // re-render all the data
  // events reloaded
  returnDatabase();
}
function setupDatabase() {
    if (!window.openDatabase) {
        var errorHTML = '<li>Web SQL Database API is not available in this browser, please try nightly Opera, Webkit or Chrome.</li>';
        return;
    }
    db = openDatabase('events', '1.0', 'events database', 2 * 1024 * 1024);
}
function dropTable() {
   db.transaction(function(tx) {
     tx.executeSql("DROP TABLE events", [],
         function(tx) { alert("dropping");
                        console.log("dropped table") },
         onError);
   });
 }
function onError(tx, error) {
  console.log(error.message);
  alert(error.message);
}

function updateAsStoredDatabase() {
    db.transaction(function (tx) {
        var len = 0;
        var html = [];

        tx.executeSql('UPDATE events set stored = 1');
    });
}

function returnDatabase() {
    db.transaction(function (tx) {
        var len = 0;
        var cleanLocation;
        var html = [];
        console.log("getting events from database for listing");
        tx.executeSql('SELECT * FROM events order by date desc', [], function (tx, results) {
            len = results.rows.length;

            for (var i = 0; i < len; i++) {
                cleanLocation = (results.rows.item(i).glat).toString() + "#" + (results.rows.item(i).glong).toString() + "#"+ encodeURI(((results.rows.item(i).location).toString()).replace("#",""));
                html.push("<div data-role='collapsible' data-theme='b' data-content-theme='d'>");
                html.push("<h2>" + results.rows.item(i).title + " On: " + results.rows.item(i).date.slice(0,10) + "</h2>");
                html.push("<div>");
                html.push('<p>Date: ' + results.rows.item(i).date.slice(0,10) + '</p>');
                html.push('<p>@' + results.rows.item(i).location + '</p>');
                html.push("<p>" + results.rows.item(i).description + "</p>");
                html.push("<a href='#' class='delevent' id=" + results.rows.item(i).id + " data-role='button' data-icon='delete' data-theme='c' data-iconpos='notext'>Delete</a>"
                    );
                html.push("  <a href='#' data-ajax='false' class='locateevent' id=" + cleanLocation + " data-role='button' data-icon='delete' data-theme='c' data-iconpos='notext'>Locate</a>"
                    );
                if ( results.rows.item(i).eurl != 'http://noevent.com')
                    html.push("  <a href='"+results.rows.item(i).eurl+ "'"+ " id=" + results.rows.item(i).id + "rel='external'>Event url</a>"
                        );
                html.push("</div>");
                html.push("</div>");
                if (len==1) {
                    html.push("<br/><p class='paradisp'>To learn how to save this web app to your home screen, Click the top right info icon</p>");
                }
            }
            listings.innerHTML = html.join('');
            $('#eventslist').find('div[data-role=collapsible]').collapsible({theme:'b',refresh:true});
            $('div[data-role=collapsible] div a.delevent').click(function (e) {
                var answer = confirm("Delete Event?")
	            if (answer){
		           var id=e.target.id;
                    deleteEvent(id);
	            }
	            else{
		            return;
	            }

            });
            $('div div a.locateevent').click(function (e) {
                $.mobile.loading("show","locating");
                   e.preventDefault();
		           var id=e.target.id;
                   var location=id.split("#");
                   var lat=location[0];
                   var long=location[1];
                   var loc=location[2];
                   setEventLocation(loc);
                   var latlong = lat + ',' + long;
                   document.getElementById("directions_panel").innerHTML=("");
                   $('#mapcanvas').gmap('destroy');
                   $('#locateEvent').show();
                   $('#mapcanvas').gmap({ 'center' : new google.maps.LatLng(lat, long), 'zoom': 15,'disableDefaultUI':true,
                       'callback': function() {
						var self = this;
						self.addMarker({'position': this.get('map').getCenter() }).click(function() {
							self.openInfoWindow({ 'content': decodeURI(loc) }, this);
						});

                    }});
                   /*$('#mapcanvas').gmap('addMarker', { 'position': latlong , 'marker': location }, function() {});*/
                   /*locateEvent(lat,long, decodeURI(location));*/
                   $.mobile.changePage('#third');
                   $.mobile.loading('hide');

            });
        });
    });
}
function deleteEvent(id) {
    db.transaction(function (tx) {
       
        console.log("deleting event ");
        tx.executeSql('DELETE FROM events  WHERE ID=?', [parseInt(id)],
                events.webdb.onSuccess,
                events.webdb.onError);
    });
}
function updateDatabase(date,
        title,
        description,
        elocation,
        end_date,
        event_id,
        elat,
        elong,
        eurl
        ) {
    db.transaction(function (tx) {
        var len = 0;
        id = parseInt(event_id);
        glat = parseFloat(elat);
        glong = parseFloat(elong);
        console.log("event " + event_id);
        db.transaction(function (tx) {
            try{
                tx.executeSql('CREATE TABLE IF NOT EXISTS events (id int NOT NULL UNIQUE, title,date,description,end_date,location,glat,glong,stored,eurl)');
            }
            catch(err){
                alert(err.message)
            }

            //});
            tx.executeSql('SELECT * FROM events WHERE id =?', [id], function (tx, results) {
                len = results.rows.length;
                if (len == 0) {
                    console.log("new entry");
                    db.transaction(function (tx) {
                        tx.executeSql('INSERT INTO events (id,title,date,description,end_date,location,glat,glong,stored,eurl) VALUES (?,?,?,?,?,?,?,?,?,?)',
                        [id,title,date,description,end_date,elocation,glat,glong,0,eurl]);
                    }, function (error) {
                        alert(error.message);
                        console.log(error.message);
                        });
                }
                else {
                    console.log("already stored this event")
                }
            });
        }, function (error) {
            console.log(error.message);
            alert(error.message);
        });

    });
}