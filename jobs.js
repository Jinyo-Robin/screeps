var utils = require('utils');

module.exports = {

	grunter: {
		/** @param {Creep} creep **/
		run: function(creep) {
			var grunterTasks = Memory.tasks
				.filter(n => n.job == 'grunter')
				.sort((a, b) => {
					return (b.priority - utils.getRange(b.ref.pos, creep.pos)) - (a.priority - utils.getRange(a.ref.pos, creep.pos));
				});
			if(grunterTasks.length){
				var enemies = [];
				enemies = [...enemies, ...creep.room.find(FIND_HOSTILE_CREEPS)];
				enemies = [...enemies, ...creep.room.find(FIND_HOSTILE_STRUCTURES).filter(n => n.structureType != STRUCTURE_CONTROLLER)];
				if(enemies.length > 0){
					creep.memory.job = 'attacker';
					creep.say('⚔️');
					jobs[creep.memory.job].run(creep);
				} else {
					Memory.tasks.splice(Memory.tasks.indexOf(grunterTasks[0]), 1);
					creep.moveTo(grunterTasks[0].ref, {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
		}
	},
	
	attacker: {
		/** @param {Creep} creep **/
		run: function(creep) {
			var enemies = [];
			enemies = [...enemies, ...creep.room.find(FIND_HOSTILE_CREEPS)];
			enemies = [...enemies, ...creep.room.find(FIND_HOSTILE_STRUCTURES).filter(n => n.structureType != STRUCTURE_CONTROLLER)];
			if(enemies.length > 0){
				enemies = enemies.sort((a, b) =>  utils.getRange(a.pos, creep.pos) - utils.getRange(b.pos, creep.pos));
				var attackerError = creep.attack(enemies[0]);
					attackerError && attackerError != ERR_NOT_IN_RANGE ? console.log(creep.pos + ' attackerError: ' + attackerError) : 0;
				if(attackerError == ERR_NOT_IN_RANGE) {
					creep.moveTo(enemies[0], {visualizePathStyle: {stroke: '#ff3333'}});
				}
			} else {
				creep.memory.job = 'grunter';
				creep.say('💂');
				jobs[creep.memory.job].run(creep);
			}
		}
	},
	
    collector: {
		/** @param {Creep} creep **/
		run: function(creep) {
			var collectorTasks = Memory.tasks
				.filter(n => n.job == 'collector')
				.sort((a, b) => {
					return (b.priority - utils.getRange(b.ref.pos, creep.pos)) - (a.priority - utils.getRange(a.ref.pos, creep.pos));
				});
			if(collectorTasks.length){
				if(collectorTasks[0].ref.store && collectorTasks[0].ref.store[RESOURCE_ENERGY]){
					if(creep.withdraw(collectorTasks[0].ref, 'energy') == ERR_NOT_IN_RANGE) {
						creep.moveTo(collectorTasks[0].ref, {visualizePathStyle: {stroke: '#ffffff'}});
						// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
						if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
					}
					/*
					if(!collectorTasks[0].ref.energy < 50){
						Memory.tasks.splice(Memory.tasks.indexOf(collectorTasks[0]), 1);
					}
					*/
				}
				if(collectorTasks[0].ref.resourceType = 'energy'){
					if(creep.pickup(collectorTasks[0].ref) == ERR_NOT_IN_RANGE) {
						creep.moveTo(collectorTasks[0].ref, {visualizePathStyle: {stroke: '#ffffff'}});
						// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
						if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
					}
					/*
					if(!collectorTasks[0].ref.energy){
						Memory.tasks.splice(Memory.tasks.indexOf(collectorTasks[0]), 1);
					}
					*/
				}
			}
			if(!collectorTasks.length || !creep.store.getFreeCapacity()) {
				creep.memory.job = 'freebee';
			}
		}
	},
	
	transferrer: {
		/** @param {Creep} creep **/
		run: function(creep) {
			var transferrerTasks = Memory.tasks
				.filter(n => n.job == 'transferrer')
				.sort((a, b) => (b.priority - utils.getRange(b.ref.pos, creep.pos)) - (a.priority - utils.getRange(a.ref.pos, creep.pos)));
			var myRefillPrio = 100 * (creep.store.getFreeCapacity(RESOURCE_ENERGY) / creep.store.getCapacity(RESOURCE_ENERGY));
			var myPrio = 0;
			if(transferrerTasks.length){
				var myDistance = transferrerTasks[0].ref.pos.getRangeTo(creep);
				myPrio = transferrerTasks[0].priority - myDistance; // maybe add a prioFlag to ignore distance for outposts
				if(!(transferrerTasks[0].ref.store.getFreeCapacity(RESOURCE_ENERGY) - creep.store[RESOURCE_ENERGY])){
					Memory.tasks.splice(Memory.tasks.indexOf(transferrerTasks[0]), 1);
				}
				if(creep.transfer(transferrerTasks[0].ref, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(transferrerTasks[0].ref, {visualizePathStyle: {stroke: '#ff3333'}});
					// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
					if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
				}
			}
			if(!transferrerTasks.length || !creep.store[RESOURCE_ENERGY] || myRefillPrio > myPrio) {
				creep.memory.job = 'freebee';
			}
		}
	},
	
    builder: {
		/** @param {Creep} creep **/
		run: function(creep) {
			var builderTasks = Memory.tasks
				.filter(n => n.job == 'builder')
				.sort((a, b) => (b.priority - utils.getRange(b.ref.pos, creep.pos)) - (a.priority - utils.getRange(a.ref.pos, creep.pos)));
			if(builderTasks.length){
				if(creep.build(builderTasks[0].ref) == ERR_NOT_IN_RANGE) {
					creep.moveTo(builderTasks[0].ref, {visualizePathStyle: {stroke: '#ff3333'}});
					// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
					if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
				}
			}
			if(!builderTasks.length || !creep.store[RESOURCE_ENERGY]) {
				creep.memory.job = 'freebee';
			}
		}
	},
	
	harvester: {
		/** @param {Creep} creep **/
		run: function(creep) {
			var harvesterTasks = Memory.tasks
				.filter(n => n.job == 'harvester')
				.sort((a, b) => (b.priority - utils.getRange(b.ref.pos, creep.pos)) - (a.priority - utils.getRange(a.ref.pos, creep.pos)));
			if(harvesterTasks.length){
				Memory.tasks.splice(Memory.tasks.indexOf(harvesterTasks[0]), 1);
				var harvestError = creep.harvest(harvesterTasks[0].ref);
				harvestError && ![ERR_NOT_IN_RANGE, ERR_NOT_ENOUGH_RESOURCES, ERR_BUSY, ERR_INVALID_TARGET].includes(harvestError) ? console.log(creep.pos + ' harvestError: ' + harvestError) : 0;
				if(harvestError == ERR_NOT_IN_RANGE || harvestError == ERR_INVALID_TARGET || harvestError == ERR_NOT_ENOUGH_RESOURCES) {
					creep.moveTo(harvesterTasks[0].ref, {visualizePathStyle: {stroke: '#ffffff'}});
					// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
					if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
				}
				if(harvestError == ERR_NOT_ENOUGH_RESOURCES){
					creep.say('⏳ energy');
				}
			}
			if(!harvesterTasks.length) {
				creep.say('⏳ location');
			}
		}
	},
	
	upgrader: {
		/** @param {Creep} creep **/
		run: function(creep) {
			var upgraderTasks = Memory.tasks
				.filter(n => n.job == 'upgrader')
				.sort((a, b) => (b.priority - utils.getRange(b.ref.pos, creep.pos)) - (a.priority - utils.getRange(a.ref.pos, creep.pos)));
			if(upgraderTasks.length){
				var upgradeError = creep.upgradeController(upgraderTasks[0].ref);
				upgradeError && ![ERR_NOT_IN_RANGE, ERR_NOT_ENOUGH_ENERGY, ERR_BUSY].includes(upgradeError) ? console.log(creep.pos + ' upgradeError: ' + upgradeError) : 0;
				if(upgradeError == ERR_NOT_IN_RANGE) {
					creep.moveTo(upgraderTasks[0].ref, {visualizePathStyle: {stroke: '#ff3333'}});
					// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
					if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
				}
			}
			if(!creep.store[RESOURCE_ENERGY]) {
				var collectorTasks = Memory.tasks
					.filter(n => n.job == 'collector')
					.sort((a, b) => (b.priority - utils.getRange(b.ref.pos, creep.pos)*70) - (a.priority - utils.getRange(a.ref.pos, creep.pos)*70));
				if(collectorTasks.length){
					if(collectorTasks[0].ref.store && collectorTasks[0].ref.store[RESOURCE_ENERGY]){
						if(creep.withdraw(collectorTasks[0].ref, 'energy') == ERR_NOT_IN_RANGE) {
							creep.moveTo(collectorTasks[0].ref, {visualizePathStyle: {stroke: '#ffffff'}});
							// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
							if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
						}
					}
					if(collectorTasks[0].ref.resourceType = 'energy'){
						if(creep.pickup(collectorTasks[0].ref) == ERR_NOT_IN_RANGE) {
							creep.moveTo(collectorTasks[0].ref, {visualizePathStyle: {stroke: '#ffffff'}});
							// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
							if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
						}
						/*
						if(!collectorTasks[0].ref.energy){
							Memory.tasks.splice(Memory.tasks.indexOf(collectorTasks[0]), 1);
						}
						*/
					}
				}
			}
		}
	},
	
	claimer: {
		/** @param {Creep} creep **/
		run: function(creep) {
			var claimerTasks = Memory.tasks
				.filter(n => n.job == 'claimer')
				.sort((a, b) => (b.priority - utils.getRange(b.ref.pos, creep.pos)) - (a.priority - utils.getRange(a.ref.pos, creep.pos)));
			if(claimerTasks.length){
				var claimError = creep.reserveController(claimerTasks[0].ref);
				claimError && claimError != ERR_NOT_IN_RANGE ? console.log(creep.pos + ' claimError: ' + claimError) : 0;
				if(claimError == ERR_NOT_IN_RANGE || claimError == ERR_INVALID_TARGET) {
					creep.moveTo(claimerTasks[0].ref, {visualizePathStyle: {stroke: '#ff3333'}});
					// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
					if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
				}
			}
			if(!creep.store[RESOURCE_ENERGY]) {
				var collectorTasks = Memory.tasks
					.filter(n => n.job == 'collector')
					.sort((a, b) => (b.priority - utils.getRange(b.ref.pos, creep.pos)*200) - (a.priority - utils.getRange(a.ref.pos, creep.pos)*200));
				if(collectorTasks.length){
					if(collectorTasks[0].ref.store && collectorTasks[0].ref.store[RESOURCE_ENERGY]){
						if(creep.withdraw(collectorTasks[0].ref, 'energy') == ERR_NOT_IN_RANGE) {
							creep.moveTo(collectorTasks[0].ref, {visualizePathStyle: {stroke: '#ffffff'}});
							// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
							if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
						}
					}
					if(collectorTasks[0].ref.resourceType = 'energy'){
						if(creep.pickup(collectorTasks[0].ref) == ERR_NOT_IN_RANGE) {
							creep.moveTo(collectorTasks[0].ref, {visualizePathStyle: {stroke: '#ffffff'}});
							// if last path was shorter than current, redo pathfinding (having pathfinding delay on 1, not on 5)
							if(creep.fatigue > 12){ creep.pos.createConstructionSite(STRUCTURE_ROAD); }
						}
						/*
						if(!collectorTasks[0].ref.energy){
							Memory.tasks.splice(Memory.tasks.indexOf(collectorTasks[0]), 1);
						}
						*/
					}
				}
			}
		}
	}
};