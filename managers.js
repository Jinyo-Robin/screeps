var jobs = require('jobs');
var GLOBALS = {
	workerscap: 3,
	GUI: true,
	visionClaim: 3,
	visionUpgrade: 1, // 0 is not at all (degrading), 1 is standard, 2 is extra,
	visionCollectEnergyResourcesDroplets: 2, // 0 is full stop of collecting, transferring and building, 1 is standard, 2 is energyDroplets overflow
	energyResourcesDropped : 0,
	energyResourcesAmount : 0,
	energyResourcesCap : 0
};
var icons = {
	freebee: ' ❓️ freebee:',
	collector: '🔄 collect',
	transferrer: '📦 transfer',
	builder: '🚧️ build',
	harvester:'🌾️ harvest',
	upgrader: '✨ upgrade'
};

module.exports = {
	
    priorities: {
		// visions: survival, expansion, cost reduction, relocation, destruction
		// strategy: diplomacy and structures
		// tactic: ressource distribution
		// motivation: priorities and proximity
		run: function() {
			Memory.tasks = [];
			
			// ====================
			// --byVision-- (emergency)
			// ====================
			
			// KPIs for vision decision-making
			GLOBALS.energyResourcesDropped	= 0;
			GLOBALS.energyResourcesAmount	= 0;
			GLOBALS.energyResourcesCap		= 0;
			for(var hashKey in Game.rooms) { var activeRoom = Game.rooms[hashKey];
				energyResourcesContainers = activeRoom.find(FIND_STRUCTURES, { filter: n => n.structureType == STRUCTURE_CONTAINER && n.store.getCapacity(RESOURCE_ENERGY)});
				for(var energyResourcesContainer of energyResourcesContainers){
					var energyResources = energyResourcesContainer.store[RESOURCE_ENERGY]
					GLOBALS.energyResourcesAmount	+= energyResources;
					GLOBALS.energyResourcesCap		+= energyResources + energyResourcesContainer.store.getFreeCapacity(RESOURCE_ENERGY);
				}
				energyResourcesDroplets = activeRoom.find(FIND_DROPPED_RESOURCES); // should be extended (scout) to more rooms to gather fallen comrades
				for(var energyResourcesDroplet of energyResourcesDroplets){
					var energyResources = energyResourcesDroplet.energy
					GLOBALS.energyResourcesDropped 	+= energyResources;
					GLOBALS.energyResourcesAmount 	+= energyResources;
				}	
			}
			
			// vision for more or less claimers and upgraders
			GLOBALS.visionClaim = 3;
			GLOBALS.visionUpgrade = GLOBALS.energyResourcesAmount > GLOBALS.energyResourcesCap ? 2 : 1;
			
			// vision for more or less transferrers
			GLOBALS.visionCollectEnergyResourcesDroplets = GLOBALS.energyResourcesDropped > 1000 ? 2 : 1;
			
			// ====================
			// --byStrategy-- (diplomacy) (mostly outside of visible rooms)
			// ====================
			
			// repairDefence
			// buildDefence
			
			// claim
			var controllerClaim = [];
			if(GLOBALS.visionClaim){
				for(var controllerFlag of _.filter(Game.flags, n => n.color == COLOR_CYAN)){
					controllerClaim = [...controllerClaim, ...[controllerFlag.room ? controllerFlag.pos.findInRange(FIND_STRUCTURES, 1, { filter: n => 
						n.structureType == STRUCTURE_CONTROLLER && !n.my})[0] : {id: '', pos: controllerFlag.pos}]];
				}
			}
			controllerClaim = controllerClaim.filter(n => n);
			
			// upgrade
			var controllerUpgrade = [];
			if(GLOBALS.visionUpgrade){
				for(var controllerFlag of _.filter(Game.flags, n => n.color == COLOR_CYAN)){
					controllerUpgrade = [...controllerUpgrade, ...[controllerFlag.room ? controllerFlag.pos.findInRange(FIND_STRUCTURES, 1, { filter: n =>
						n.structureType == STRUCTURE_CONTROLLER && n.my})[0] : undefined]];
				}
			}
			controllerUpgrade = controllerUpgrade.filter(n => n);
			
			// harvest
			var harvestEnergySources = []; // job: harvester
			for(var sourceFlag of _.filter(Game.flags, n => n.color == COLOR_YELLOW)){
				harvestEnergySources = [...harvestEnergySources, ...[sourceFlag.room ? sourceFlag.pos.findInRange(FIND_SOURCES, 1)[0] : {id: '', pos: sourceFlag.pos}]];
			}
			harvestEnergySources = harvestEnergySources.filter(n => n);
			
			// hold
			var holdPositions = [];
			for(var holderFlag of _.filter(Game.flags, n => n.color == COLOR_PURPLE)){
				holdPositions = [...holdPositions, ...[{id: '', pos: holderFlag.pos}]];
			}
			holdPositions = holdPositions.filter(n => n);
			// attack
			attackPositions = [];
			for(var attackerFlag of _.filter(Game.flags, n => n.color == COLOR_RED)){
				attackPositions = [...attackPositions, ...[{id: '', pos: attackerFlag.pos}]];
			}
			attackPositions = attackPositions.filter(n => n);
			// scout
			var scoutPositions = []
			for(var scouterFlag of _.filter(Game.flags, n => n.color == COLOR_GREEN)){
				scoutPositions = [...scoutPositions, ...[{id: '', pos: scouterFlag.pos}]];
			}
			scoutPositions = scoutPositions.filter(n => n);
			
			var buildDefence = []; // job: builder
			buildDefence = [...buildDefence, ..._.filter(Game.constructionSites, n =>	
				n.structureType == STRUCTURE_SPAWN ||
				n.structureType == STRUCTURE_EXTENSION ||
				n.structureType == STRUCTURE_WALL ||
				n.structureType == STRUCTURE_RAMPART ||
				n.structureType == STRUCTURE_CONTROLLER ||
				n.structureType == STRUCTURE_TOWER)];

			var buildOffence = []; // job: builder
			buildOffence = [...buildOffence, ..._.filter(Game.constructionSites, n =>
				n.structureType == STRUCTURE_OBSERVER ||
				n.structureType == STRUCTURE_POWER_BANK ||
				n.structureType == STRUCTURE_POWER_SPAWN)];

			var buildSupply = []; // job: builder
			buildSupply = [...buildSupply, ..._.filter(Game.constructionSites, n =>
				n.structureType == STRUCTURE_STORAGE ||
				n.structureType == STRUCTURE_CONTAINER ||
				n.structureType == STRUCTURE_EXTRACTOR ||
				n.structureType == STRUCTURE_LAB)];
			
			for(var containerFlag of _.filter(Game.flags, n => n.color == COLOR_BROWN)){
				containerFlag.pos.createConstructionSite(STRUCTURE_CONTAINER);
			}
			
			var buildEfficiency = []; // job: builder
			buildEfficiency = [...buildEfficiency, ..._.filter(Game.constructionSites, n =>
				!(
				n.structureType == STRUCTURE_SPAWN ||
				n.structureType == STRUCTURE_WALL ||
				n.structureType == STRUCTURE_RAMPART ||
				n.structureType == STRUCTURE_CONTROLLER ||
				n.structureType == STRUCTURE_TOWER ||
				n.structureType == STRUCTURE_OBSERVER ||
				n.structureType == STRUCTURE_POWER_BANK ||
				n.structureType == STRUCTURE_POWER_SPAWN ||
				n.structureType == STRUCTURE_EXTENSION ||
				n.structureType == STRUCTURE_STORAGE ||
				n.structureType == STRUCTURE_CONTAINER ||
				n.structureType == STRUCTURE_EXTRACTOR ||
				n.structureType == STRUCTURE_LAB
				)
				)];
			
			// ====================
			// --byTactic-- (rooms) (inside of visible area)
			// ====================
			
			var transferEnergyStorage = []; // job: transferrer
			var transferEnergyResourceContainers = []; // job: transferrer
			var collectEnergyResources = []; // job: collector
			var collectEnergyDeposits = []; // job: collector
			var collectEnergyResourcesContainers = []; // job: collector
			var collectEnergyStorage = []; // job: collector
			
			// alot here may be found with Game.structures in a better way
			for(var hashKey in Game.rooms) { // all Rooms with owned buildings or creeps (activeRooms)
				var activeRoom = Game.rooms[hashKey];
				// job: transferrer
				transferEnergyStorage = [...transferEnergyStorage, ...activeRoom.find(FIND_MY_STRUCTURES, { filter: n =>
					(n.structureType == STRUCTURE_EXTENSION || n.structureType == STRUCTURE_SPAWN) &&
					n.store.getFreeCapacity(RESOURCE_ENERGY)})];
				transferEnergyResourceContainers = [...transferEnergyResourceContainers, ...activeRoom.find(FIND_STRUCTURES, { filter: n =>// should be checked in all safeRooms (active and resource)
					n.structureType == STRUCTURE_CONTAINER &&
					n.store.getFreeCapacity(RESOURCE_ENERGY)})];
				// job: collector
				collectEnergyResources = [...collectEnergyResources, ...activeRoom.find(FIND_DROPPED_RESOURCES, { filter: n => // should be extended (scout) to more rooms to gather fallen comrades
					n.energy})];
				collectEnergyResourcesContainers = [...collectEnergyResourcesContainers, ...activeRoom.find(FIND_STRUCTURES, { filter: n =>
					n.structureType == STRUCTURE_CONTAINER &&
					n.store[RESOURCE_ENERGY]})];
				collectEnergyStorage = [...collectEnergyStorage, ...activeRoom.find(FIND_MY_STRUCTURES, { filter: n => // should be checked in active rooms
					(n.structureType == STRUCTURE_EXTENSION || n.structureType == STRUCTURE_SPAWN) && 
					n.store[RESOURCE_ENERGY]})];
				collectEnergyDeposits = [...collectEnergyDeposits, ...activeRoom.find(FIND_TOMBSTONES, { filter: n => // should be extended to more rooms to gather fallen comrades
					n.store[RESOURCE_ENERGY]})];
				collectEnergyDeposits = [...collectEnergyDeposits, ...activeRoom.find(FIND_RUINS, { filter: n => // should be extended to more rooms to gather fallen comrades
					n.store[RESOURCE_ENERGY]})];
			}
			
			// ====================
			// --byMotivation-- (creep) (let the creep handle this, just give him money / priority)
			// ====================
			
			// job for an attack leader missing (for a group. the strongest creep with most health, attack and life time, to focus attack and to let weak attackers heal up)
			// jobs for attacke missing (dying of age creeps go kamikaze, grunters become attackers as a group if the enemy is weak)
			// jobs for defender missing (going all in if the enemy attacks, also calling for help if needed)
			for(var n of transferEnergyStorage) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'transferrer',
					priority: 140,
					ref: n}]];
			}
			for(var n of holdPositions) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'holder',
					priority: 130,
					ref: n}]];
			}
			for(var n of buildDefence) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'builder',
					priority: 130,
					ref: n}]];
			}
			for(var n of attackPositions) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'grunter',
					priority: 80,
					ref: n}]];
			}
			for(var n of buildOffence) {
				var priorityFlag = Game.spawns['Spawn1'].room.energyAvailable / Game.spawns['Spawn1'].room.energyCapacityAvailable > 0.8 ? 20 : 0;
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'builder',
					priority: 80 + priorityFlag,
					ref: n}]];
			}
			for(var n of scoutPositions) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'scouter',
					priority: 80,
					ref: n}]];
			}
			for(var n of buildSupply) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'builder',
					priority: 80,
					ref: n}]];
			}
			for(var n of buildEfficiency) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'builder',
					priority: 60,
					ref: n}]];
			}
			for(var n of transferEnergyResourceContainers) {
				var disableFlag = n.pos.lookFor(LOOK_FLAGS).toString() == '' || n.pos.lookFor(LOOK_FLAGS).toString() != '' && n.pos.lookFor(LOOK_FLAGS)[0].color == COLOR_YELLOW ? 0 : 1;
				var priorityFlag = n.pos.lookFor(LOOK_FLAGS).toString() != '' && n.pos.lookFor(LOOK_FLAGS)[0].color == COLOR_BROWN ? 15 : 0;
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'transferrer',
					priority: (10 + 60 *(n.store.getFreeCapacity(RESOURCE_ENERGY) / n.store.getCapacity(RESOURCE_ENERGY)) + priorityFlag) * disableFlag, // between 10 and 70; 25 to 85 with flag
					ref: n}]];
			}
			for(var n of collectEnergyDeposits) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job:'collector',
					priority: 70 + n.store[RESOURCE_ENERGY], // from 70 up to around 400 and more
					ref: n}]];
			}
			for(var n of collectEnergyResources) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'collector',
					priority: 80 + n.energy / 10, // from 80 up to around 200 and more
					ref: n}]];
			}
			for(var n of collectEnergyResourcesContainers) {
				var priorityFlag = n.pos.lookFor(LOOK_FLAGS).toString() != '' && n.pos.lookFor(LOOK_FLAGS)[0].color == COLOR_YELLOW ? 45 : 0;
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'collector',
					priority: 15 + n.store[RESOURCE_ENERGY] / 50 + priorityFlag, // between 15 and around 55; 60 to 100 with flag
					ref: n}]];
			}
			for(var n of collectEnergyStorage) { // eg. Spawn, Extension
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'collector',
					priority: n.store[RESOURCE_ENERGY] / 20, // around 15 for 300er Spawn
					ref: n}]];
			}
			for(var n of harvestEnergySources) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'harvester',
					priority: 60,
					ref: n}]];
			}
			for(var n of controllerClaim) {
				var priorityFlag = n.room && n.pos.lookFor(LOOK_FLAGS).toString() != '' && n.pos.lookFor(LOOK_FLAGS)[0].color == COLOR_CYAN ?
					100 * (10 - parseInt(n.pos.lookFor(LOOK_FLAGS)[0].name, 10)) :
					400;
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'claimer',
					priority: 0 + priorityFlag, // 20 + (20000 - controllerUpgrade[hashKey].ticksToDowngrade) / 5,
					ref: n}]];
			}
			for(var n of controllerUpgrade) {
				Memory.tasks = [...Memory.tasks, ...[{
					id: n.id,
					job: 'upgrader',
					priority: 0, // 20 + (20000 - controllerUpgrade[hashKey].ticksToDowngrade) / 5,
					ref: n}]];
			}
		}
	},
	
	population: {
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
			var desiredClaimers =			GLOBALS.visionClaim * Memory.tasks.filter(n => n.job == 'claimer').length;
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
			var desiredUpgraders =			GLOBALS.visionUpgrade * Math.ceil(desiredHarvesters/2);
			var limitedDesiredUpgraders =	GLOBALS.visionUpgrade * Math.ceil(amountOfHarvesters/2);
			var enoughUpgraders =			amountOfUpgraders >= limitedDesiredUpgraders;
			// Workers
			var amountOfWorkers =			_.filter(Game.creeps, creep => creep.memory.job != 'harvester' && creep.memory.job != 'upgrader').length;
			var desiredWorkers =			GLOBALS.visionCollectEnergyResourcesDroplets * Math.ceil((desiredHarvesters + desiredUpgraders)/2);
			var enoughWorkers =				amountOfWorkers >= desiredWorkers;
			GLOBALS.workerscap =			desiredHarvesters + desiredUpgraders + desiredWorkers;
			// Spawn1
			// ToDo: check is spawn is not busy
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
	},
	
    investments: {
		run: function() {
			for(var name in Game.creeps) {
				var creep = Game.creeps[name];
				if(creep.memory.job != 'freebee') {
					jobs[creep.memory.job].run(creep);
				}
				if(creep.memory.job == 'freebee') {
					if(creep.store.getFreeCapacity() == 0){
						var actionTasks = Memory.tasks
							.filter(n => ['builder', 'transferrer' /*, 'repairer' */ ].includes(n.job))
							.sort((a, b) => (b.priority - b.ref.pos.getRangeTo(creep)) - (a.priority - a.ref.pos.getRangeTo(creep)));
						if(actionTasks.length){
							creep.memory.job = actionTasks[0].job;
							creep.say(icons[creep.memory.job]);
							jobs[creep.memory.job].run(creep);
						}
					} else if(creep.store[RESOURCE_ENERGY]){
						var allTasks = Memory.tasks
							.filter(n => ['builder', 'transferrer' /*, 'repairer' */, 'collector'].includes(n.job))
							.sort((a, b) => (b.priority - b.ref.pos.getRangeTo(creep)) - (a.priority - a.ref.pos.getRangeTo(creep)));
						if(allTasks.length){
							creep.memory.job = allTasks[0].job;
							creep.say(icons[creep.memory.job]);
							jobs[creep.memory.job].run(creep);
						}
					} else if(!creep.store[RESOURCE_ENERGY]){
						var gatherTasks = Memory.tasks
							.filter(n => n.job == 'collector')
							.sort((a, b) => (b.priority - b.ref.pos.getRangeTo(creep)) - (a.priority - a.ref.pos.getRangeTo(creep)));
						if(gatherTasks.length){
							creep.memory.job = gatherTasks[0].job;
							creep.say(icons[creep.memory.job]);
							jobs[creep.memory.job].run(creep);
						}
					} else {
						creep.memory.job = 'collector';
						creep.say(icons[creep.memory.job]);
						jobs[creep.memory.job].run(creep);
					}
				}
			}
		}
	},
	
    risks: {
		run: function() {
		}
	},
	
    raids: {
		run: function() {
		}
	},
	
    defence: {
		run: function() {
		}
	},
	
	manuals: {
		run: function() {
			if(GLOBALS.GUI) {
				Game.spawns['Spawn1'].room.visual.text(
					' ⚡ ' + GLOBALS.energyResourcesAmount + ' / ' + GLOBALS.energyResourcesCap + '  | ' +
					' 🛠 ' + _.filter(Game.creeps, creep => true).length + ' / ' + GLOBALS.workerscap,
					48, 47, {align: 'right', opacity: 0.8});
				Game.spawns['Spawn1'].room.visual.text(
					'   (⚡ ' + GLOBALS.energyResourcesDropped + ')   |' +
					'   ( ❓ ' + _.filter(Game.creeps, creep => creep.memory.job == 'freebee').length + ')' +
					'   (🔄 ' + _.filter(Game.creeps, creep => creep.memory.job == 'collector').length + ')' +
					'   (📦 ' + _.filter(Game.creeps, creep => creep.memory.job == 'transferrer').length + ')' +
					'   (🚧️ ' + _.filter(Game.creeps, creep => creep.memory.job == 'builder').length + ')' +
					'   (🌾️ ' + _.filter(Game.creeps, creep => creep.memory.job == 'harvester').length + ')' +
					'   (✨ ' + _.filter(Game.creeps, creep => creep.memory.job == 'upgrader').length + ')',
					48, 48, {align: 'right', opacity: 0.6});
			}
			
			if(GLOBALS.GUI) {
				var tablePosition = {x: 1, y: 2};
				var tableWidths = [4, 2, 7];
				var opacity = 0.1;
				Memory.tasks.sort((a, b) => b.priority - a.priority
				);
					Game.spawns['Spawn1'].room.visual.text('job ' + Memory.tasks.length, tablePosition.x, tablePosition.y -1, {align: 'left', opacity: 0.8});
					Game.spawns['Spawn1'].room.visual.text('prio', tablePosition.x + tableWidths[0], tablePosition.y -1, {align: 'left', opacity: 0.8});
					Game.spawns['Spawn1'].room.visual.text('pos', tablePosition.x + tableWidths[0] + tableWidths[1], tablePosition.y -1, {align: 'left', opacity: 0.8});
					Game.spawns['Spawn1'].room.visual.text('ref', tablePosition.x + tableWidths[0] + tableWidths[1] + tableWidths[2], tablePosition.y -1, {align: 'left', opacity: 0.8});
				for(var nr in Memory.tasks){
					Game.spawns['Spawn1'].room.visual.text(Memory.tasks[nr].job, tablePosition.x, tablePosition.y + parseInt(nr), {align: 'left', opacity: opacity});
					Game.spawns['Spawn1'].room.visual.text(Math.floor(Memory.tasks[nr].priority), tablePosition.x + tableWidths[0] + tableWidths[1] -1, tablePosition.y + parseInt(nr), {align: 'right', opacity: opacity});
					Game.spawns['Spawn1'].room.visual.text(Memory.tasks[nr].ref.pos.toString().substring(6,25), tablePosition.x + tableWidths[0] + tableWidths[1], tablePosition.y + parseInt(nr), {align: 'left', opacity: opacity});
					Game.spawns['Spawn1'].room.visual.text(Memory.tasks[nr].ref.toString().substring(0,25), tablePosition.x + tableWidths[0] + tableWidths[1] + tableWidths[2], tablePosition.y + parseInt(nr), {align: 'left', opacity: opacity});
				}
			}
			
			if(Game.spawns['Spawn1'].spawning) { 
				var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
				Game.spawns['Spawn1'].room.visual.text(
					'🛠' + spawningCreep.memory.job,
					Game.spawns['Spawn1'].pos.x + 1,
					Game.spawns['Spawn1'].pos.y, 
					{align: 'left', opacity: 0.8});
			}
		}
	}
};