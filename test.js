var Tile = require('./tile');


while (1==1) {
	var latitude = Math.random() * 160.0 - 80.0;
	var longitude = Math.random() * 360.0 - 180.0;
	var zoom = Math.floor( Math.random() * 18 );

	console.log('latitude: ' + latitude + ' longitude: ' + longitude + ' zoom: ' + zoom);

	var tileId = Tile.tileIdFromLatLong(latitude, longitude, zoom);
	var tile = Tile.tileFromTileId(tileId);
	console.dir(tile);

	if (tile.zoom !== zoom) {
		console.log('zoom different than expected: ' + tile.zoom + ' vs. expected ' + zoom);
		process.exit(0);
	}

	if (tile.latitudeSouth <= latitude && tile.latitudeNorth >= latitude &&
		tile.longitudeWest <= longitude && tile.longitudeEast >= longitude) {

	} else {
		console.log('tile bounds do not include point');
		console.dir(tile);

		process.exit(0);
	}
}

/*
var latitude = 37.0100086;
var longitude = -122.0541026;
var zoom = 14;

var tileId = Tile.tileIdFromLatLong(latitude, longitude, zoom);
var tile = Tile.tileFromTileId(tileId);

console.dir(tile);
*/
