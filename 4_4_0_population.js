// population
module.exports = function population (population_version) {
    if (population_version == '1.0') {
        return (configuration, externals, ai) => { return {
            // "To maintain the maximum movement speed of 1 square per tick, a creep needs to have as many MOVE parts as all the other parts of its body combined."
            run: function() {
                for(var name in Memory.creeps) {
                    if(!Game.creeps[name]) {
                        delete Memory.creeps[name];
                        console.log('Clearing non-existing creep memory:', name);
                    }
                }
                // Spawn1
                var fullEnergy = 				Game.spawns['Spawn1'].room.energyCapacityAvailable == Game.spawns['Spawn1'].room.energyAvailable;
                // Claimers
                var biggestClaimer =			800;
                var amountOfClaimers =			_.filter(Game.creeps, creep => creep.memory.job == 'claimer').length;
                var desiredClaimers =			ai.state.visionClaim * Memory.tasks.filter(n => n.job == 'claimer').length;
                var enoughClaimers =			amountOfClaimers >= desiredClaimers;
                // Attackers
                var amountOfGrunters = 			_.filter(Game.creeps, creep => creep.memory.job == 'grunter').length;
                var desiredAttackers =			Memory.tasks.filter(n => n.job == 'grunter').length;
                var enoughAttackers =			amountOfGrunters >= desiredAttackers;
                // Harvesters
                var biggestHarvester = 			550;
                var amountOfHarvesters =		_.filter(Game.creeps, creep => creep.memory.job == 'harvester').length;
                var desiredHarvesters =			Memory.tasks.filter(n => n.job == 'harvester').length;
                var enoughHarvesters =			amountOfHarvesters >= desiredHarvesters;
                // Upgraders
                var amountOfUpgraders =			_.filter(Game.creeps, creep => creep.memory.job == 'upgrader').length;
                var desiredUpgraders =			ai.state.visionUpgrade * Math.ceil(desiredHarvesters/2);
                var limitedDesiredUpgraders =	ai.state.visionUpgrade * Math.ceil(amountOfHarvesters/2);
                var enoughUpgraders =			amountOfUpgraders >= limitedDesiredUpgraders;
                // Workers
                var amountOfWorkers =			_.filter(Game.creeps, creep => creep.memory.job != 'harvester' && creep.memory.job != 'upgrader').length;
                var desiredWorkers =			ai.state.visionCollectEnergyResourcesDroplets * Math.ceil((desiredHarvesters + desiredUpgraders)/2);
                var enoughWorkers =				amountOfWorkers >= desiredWorkers;
                ai.state.workerscap =			desiredHarvesters + desiredUpgraders + desiredWorkers;
                // Spawn1
                // ToDo: check if spawn is not busy
                if(!enoughClaimers && (fullEnergy && Game.spawns['Spawn1'].room.energyAvailable >= 750 || Game.spawns['Spawn1'].room.energyAvailable >= biggestClaimer)) {
                    var newName = 'Claimer' + Game.time;
                    console.log('Spawning new Claimer: ' + newName);
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(CARRY),...Array( 2).fill(MOVE),...Array( 1).fill(CLAIM)], newName, {memory: {job: 'claimer'}});
                } else if(!amountOfHarvesters && Game.spawns['Spawn1'].room.energyAvailable >= 250 || amountOfWorkers && !enoughHarvesters && (fullEnergy || Game.spawns['Spawn1'].room.energyAvailable >= biggestHarvester)){
                    var newName = 'Harvester' + Game.time;
                    console.log('Spawning new Harvester: ' + newName);
                    Game.spawns['Spawn1'].spawnCreep([...Array( 5).fill(WORK),...Array( 5).fill(MOVE)], newName, {memory: {job: 'harvester'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 5).fill(WORK),...Array( 4).fill(MOVE)], newName, {memory: {job: 'harvester'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 5).fill(WORK),...Array( 3).fill(MOVE)], newName, {memory: {job: 'harvester'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 5).fill(WORK),...Array( 2).fill(MOVE)], newName, {memory: {job: 'harvester'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 5).fill(WORK),...Array( 1).fill(MOVE)], newName, {memory: {job: 'harvester'}}); // RCL 2 (550); max to empty 3000er source in 300 ticks
                    Game.spawns['Spawn1'].spawnCreep([...Array( 4).fill(WORK),...Array( 2).fill(MOVE)], newName, {memory: {job: 'harvester'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 4).fill(WORK),...Array( 1).fill(MOVE)], newName, {memory: {job: 'harvester'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 3).fill(WORK),...Array( 2).fill(MOVE)], newName, {memory: {job: 'harvester'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 3).fill(WORK),...Array( 1).fill(MOVE)], newName, {memory: {job: 'harvester'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 2).fill(WORK),...Array( 1).fill(MOVE)], newName, {memory: {job: 'harvester'}}); // RCL 1 (300)
                } else if(!amountOfWorkers && Game.spawns['Spawn1'].room.energyAvailable >= 250 || !enoughWorkers && fullEnergy) {
                    var newName = 'Worker' + Game.time;
                    console.log('Spawning new Worker: ' + newName);
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array(16).fill(CARRY),...Array(17).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array(15).fill(CARRY),...Array(16).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array(14).fill(CARRY),...Array(15).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array(13).fill(CARRY),...Array(14).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array(12).fill(CARRY),...Array(13).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array(11).fill(CARRY),...Array(12).fill(MOVE)], newName, {memory: {job: 'freebee'}}); // RCL 4 (1300)
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array(10).fill(CARRY),...Array(11).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 9).fill(CARRY),...Array(10).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 8).fill(CARRY),...Array( 9).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 7).fill(CARRY),...Array( 8).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 6).fill(CARRY),...Array( 7).fill(MOVE)], newName, {memory: {job: 'freebee'}}); // RCL 3 (800)
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 5).fill(CARRY),...Array( 6).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 4).fill(CARRY),...Array( 5).fill(MOVE)], newName, {memory: {job: 'freebee'}}); // RCL 2 (550)
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 3).fill(CARRY),...Array( 4).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 2).fill(CARRY),...Array( 3).fill(MOVE)], newName, {memory: {job: 'freebee'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'freebee'}}); // RCL 1 (300)
                } else if(!enoughAttackers && fullEnergy) {
                    var newName = 'Attacker' + Game.time;
                    console.log('Spawning new Attacker: ' + newName);
                    Game.spawns['Spawn1'].spawnCreep([...Array( 1).fill(ATTACK),...Array( 1).fill(MOVE)], newName, {memory: {job: 'grunter'}});
                } else if(!enoughUpgraders && fullEnergy) {
                    var newName = 'Upgrader' + Game.time;
                    console.log('Spawning new Upgrader: ' + newName);
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array(11).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array(10).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 9).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 8).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 7).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 6).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 5).fill(MOVE)], newName, {memory: {job: 'upgrader'}}); // RCL 4 (1300)
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 4).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 3).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array(10).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 9).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 9).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 8).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 8).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 7).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 7).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}}); // RCL 3 (800)
                    Game.spawns['Spawn1'].spawnCreep([...Array( 6).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 6).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 5).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 5).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 4).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}}); // RCL 2 (550)
                    Game.spawns['Spawn1'].spawnCreep([...Array( 4).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 3).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 3).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 2).fill(WORK),...Array( 1).fill(CARRY),...Array( 2).fill(MOVE)], newName, {memory: {job: 'upgrader'}});
                    Game.spawns['Spawn1'].spawnCreep([...Array( 2).fill(WORK),...Array( 1).fill(CARRY),...Array( 1).fill(MOVE)], newName, {memory: {job: 'upgrader'}}); // RCL 1 (300)
                }
            }
        }}
    }
};