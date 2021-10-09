// internals - state
module.exports = (state_version) => {
    if (state_version == "1.0") { return (configuration, dependencies, ai) => { return {
        workerscap: 3,
        GUI: true,
        visionClaim: 3,
        visionUpgrade: 1, // 0 is not at all (degrading), 1 is standard, 2 is extra,
        visionCollectEnergyResourcesDroplets: 2, // 0 is full stop of collecting, transferring and building, 1 is standard, 2 is energyDroplets overflow
        energyResourcesDropped : 0,
        energyResourcesAmount : 0,
        energyResourcesCap : 0,
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
    }}}
};
