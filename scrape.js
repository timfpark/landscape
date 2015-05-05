var async = require('async')
  , fs = require('fs')
  , request = require('request')
  , Tile = require('./tile')

var fetchBbox = {
	north: 38,
	south: 36,
	east: -121,
	west: -122
};

var latitude = fetchBbox.north;
var longitude = fetchBbox.west;

var latitudePerTile = 180.0 / Math.pow(2, 18);
var longitudePerTile = 360.0 / Math.pow(2, 18);

var startTime = new Date();
var totalTiles = 0;

async.forever(
	function(next) {

		console.log('fetching tile at ' + latitude + ',' + longitude);

		var tileId18 = Tile.tileIdFromLatLong(latitude, longitude, 18);
		var tileIds = Tile.tileIdsForAllZoomLevels(tileId18);

		async.eachSeries(tileIds, function(tileId, callback) {
			fetchTileId(tileId, callback);
		}, function(err) {
			longitude += longitudePerTile;
			if (longitude > fetchBbox.east) {
				latitude -= latitudePerTile;
				longitude = fetchBbox.west;
			}

			if (latitude < fetchBbox.south) {
				console.log('finished');
				process.exit(0);
			}

			return next();
		});
	},

	function(err) { }
);

function fetchTileId(tileId, callback) {
	var tile = Tile.tileFromTileId(tileId);

	if (!fs.existsSync('tiles')) 									fs.mkdirSync('tiles');
	if (!fs.existsSync('tiles/' + tile.zoom)) 						fs.mkdirSync('tiles/' + tile.zoom);
	if (!fs.existsSync('tiles/' + tile.zoom + '/' + tile.column)) 	fs.mkdirSync('tiles/' + tile.zoom + '/' + tile.column);

	var path = tile.zoom + '/' + tile.column + '/' + tile.row + '.png';
	var filePath = 'tiles/' + path;
	if (fs.existsSync(filePath))
		return callback();

	var tileUrl = 'http://a.tile.thunderforest.com/landscape/' + path;

	console.log(new Date() + ' fetching ' + path);

	request({
		url: tileUrl,
		encoding: null,
		method: 'GET'
	}, function(err, response, image) {
		if (err) return callback(err);

		totalTiles++;

		var currentTime = new Date();
		var delta = currentTime.getTime() - startTime.getTime();
		var minMilliseconds = totalTiles * 600;
		var waitTime = Math.max(0, minMilliseconds - delta);

		if (waitTime > 0)
			console.log('waiting ' + waitTime);

		setTimeout(function() {
			fs.writeFile(filePath, image, 'binary', callback);
		}, waitTime);
	});
}