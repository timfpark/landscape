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

var currentTileId = Tile.tileIdFromLatLong(fetchBbox.north, fetchBbox.west, 18);
var topLeftTile = Tile.tileFromTileId(currentTileId);

var startTime = new Date();
var totalTiles = 0;
var finishedTiles = 0;

async.forever(
	function(next) {
		var tileIds = Tile.tileIdsForAllZoomLevels(currentTileId);

		tileIds.forEach(function(tileId) {
			totalTiles += fetchTileId(tileId);
		});

		var tile = Tile.decodeTileId(currentTileId);

		currentTileId = Tile.tileIdFromRowColumn(tile.row, tile.column+1, 18);

		var tile = Tile.tileFromTileId(currentTileId);
		console.log('fetching tile at ' + tile.latitudeNorth + ',' + tile.longitudeWest, ': ' + currentTileId);

		if (tile.longitudeWest > fetchBbox.east) {
			tile.row++;
			tile.column = topLeftTile.column;

			currentTileId = Tile.tileIdFromRowColumn(tile.row, tile.column, 18);
			tile = Tile.tileFromTileId(currentTileId);
		}

		if (tile.latitudeNorth < fetchBbox.south) {
			console.log('finished');
			process.exit(0);
		}

		console.log('totalTiles: ' + totalTiles + ' finishedTiles: ' + finishedTiles);

		var currentTime = new Date();
		var delta = currentTime.getTime() - startTime.getTime();
		var minMilliseconds = totalTiles * 600;
		var waitTime = Math.max(0, minMilliseconds - delta);

		if (waitTime > 0)
			console.log('waiting ' + waitTime);

		setTimeout(function() {
			return next();
		}, waitTime);
	},

	function(err) { }
);

function fetchTileId(tileId, callback) {
	var tile = Tile.decodeTileId(tileId);

	if (!fs.existsSync('tiles')) 									fs.mkdirSync('tiles');
	if (!fs.existsSync('tiles/' + tile.zoom)) 						fs.mkdirSync('tiles/' + tile.zoom);
	if (!fs.existsSync('tiles/' + tile.zoom + '/' + tile.column)) 	fs.mkdirSync('tiles/' + tile.zoom + '/' + tile.column);

	var path = tile.zoom + '/' + tile.column + '/' + tile.row + '.png';
	var filePath = 'tiles/' + path;
	if (fs.existsSync(filePath))
		return 0;

	var tileUrl = 'http://a.tile.thunderforest.com/landscape/' + path;

	console.log(' fetching ' + path);

	request({
		url: tileUrl,
		encoding: null,
		method: 'GET'
	}, function(err, response, image) {
		if (err) return callback(err);

		fs.writeFileSync(filePath, image, 'binary');
		finishedTiles++;
	});

	return 1;
}