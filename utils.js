/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utils');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
	getRange: function (pos1, pos2) {
		var range = pos1.getRangeTo(pos2);
		if(range == Infinity){
			var mapPos1 = this.parseMapPosition(pos1);
			var mapPos2 = this.parseMapPosition(pos2);
			var dist = 50 * (Math.abs(mapPos1.x - mapPos2.x) + Math.abs(mapPos1.y - mapPos2.y));
			return dist;
		} else {
			return range;
		}
	},
	
	parseMapPosition: function (pos) {
		var mapPosition = {x:0, y:0};
		var n = pos.roomName.indexOf('N');
		var w = pos.roomName.indexOf('W');
		if (n != -1) {																																	// NORTH
			if (w != -1) { mapPosition = {x: -1 * (parseInt(pos.roomName.substr(1,n-1), 10) + 1), y: pos.roomName.substr(n+1)}; } 								else { mapPosition = {x: pos.roomName.substr(1,n-1), y: pos.roomName.substr(n+1)}; }
		} else {																																// WEST				// EAST
			var s = pos.roomName.indexOf('S');
			if (w != -1) { mapPosition = {x: -1 * (parseInt(pos.roomName.substr(1,s-1), 10) + 1), y: -1 * (parseInt(pos.roomName.substr(s+1), 10) + 1)}; } 	else { mapPosition = {x: pos.roomName.substr(1,s-1), y: -1 * (parseInt(pos.roomName.substr(s+1), 10) + 1)}; }
		}																																				// SOUTH
		return mapPosition;
	}
};