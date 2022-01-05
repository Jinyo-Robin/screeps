// ai priorities

// this module identifies all tasks, KPIs and targets and prioritises them depending on current configuration

module.exports = function ai_priorities (ai_priorities_version) {
    if (ai_priorities_version == '1.0') { return (configuration, externals, ai) => { return {
        // visions: survival, expansion, cost reduction, relocation, destruction
        // strategy: diplomacy and structures
        // tactic: ressource distribution
        // motivation: priorities and proximity
        run: function ai_priorities () {
            Memory.tasks = [];

            // ====================
            // --byVision-priority-- (emergency)
            // --> goals, trends, KPIs to be expanded and optimized
            // --> passion, believe and mutual mission to be promoted
            // --> the why and what for
            // --> hopes and fears
            // ====================

            // KPIs (ai.state.energy*) for vision-priority decision-making
            // visible dropped energy
            ai.state.energyResourcesDropped	= 0;
            // currently in visible containers stored energy and visible dropped energy
            ai.state.energyResourcesAmount	= 0;
            // maximum energy capacity of visible containers
            ai.state.energyResourcesCap		= 0;
            // all visible rooms
            for(var hashKey in Game.rooms) {
                var activeRoom = Game.rooms[hashKey];
                // all visible containers with energy
                var energyResourcesContainers = activeRoom.find(
                    FIND_STRUCTURES, { filter: n =>
                    n.structureType == STRUCTURE_CONTAINER &&
                    n.store.getCapacity(RESOURCE_ENERGY) }
                );
                for(var energyResourcesContainer of energyResourcesContainers){
                    var energyResources = energyResourcesContainer.store[RESOURCE_ENERGY];
                    ai.state.energyResourcesAmount	+= energyResources;
                    ai.state.energyResourcesCap		+= energyResources + energyResourcesContainer.store.getFreeCapacity(RESOURCE_ENERGY);
                }
                // all visible energy droplets
                // should be extended (scout) to more (non visible) rooms to gather fallen comrades
                var energyResourcesDroplets = activeRoom.find(FIND_DROPPED_RESOURCES);
                for(var energyResourcesDroplet of energyResourcesDroplets){
                    var energyResources = energyResourcesDroplet.energy
                    ai.state.energyResourcesDropped += energyResources;
                    ai.state.energyResourcesAmount 	+= energyResources;
                }
            }

            // vision for more or less claimers and upgraders
            ai.state.visionClaim = 3;
            ai.state.visionUpgrade = ai.state.energyResourcesAmount > ai.state.energyResourcesCap ? 2 : 1;

            // vision for more or less transferrers
            ai.state.visionCollectEnergyResourcesDroplets = ai.state.energyResourcesDropped > 1000 ? 2 : 1;

            // ====================
            // --byStrategy-- (diplomacy) (mostly outside of visible rooms)
            // --> prehensible milestones and targets
            // --> potential resources to be utilized
            // --> mostly flag controlled and structures
            // ====================

            // repairDefence
            // buildDefence

            // claim
            var controllerClaim = [];
            if (ai.state.visionClaim) { // currently always 3
                for ( var controllerFlag of _.filter( Game.flags, n => n.color == COLOR_CYAN ) ) {
                    controllerClaim = [
                        ...controllerClaim,
                        ...[controllerFlag.room
                            ?
                            controllerFlag.pos.findInRange(
                                FIND_STRUCTURES,
                                1,
                                { filter: n => n.structureType == STRUCTURE_CONTROLLER && !n.my }
                            )[0]
                            :
                            { id: '', pos: controllerFlag.pos }
                        ]
                    ];
                }
            }
            controllerClaim = controllerClaim.filter(n => n);

            // upgrade
            var controllerUpgrade = [];
            if (ai.state.visionUpgrade) {
                for ( var controllerFlag of _.filter( Game.flags, n => n.color == COLOR_CYAN ) ) {
                    controllerUpgrade = [
                        ...controllerUpgrade,
                        ...[controllerFlag.room
                            ?
                            controllerFlag.pos.findInRange(
                                FIND_STRUCTURES,
                                1,
                                { filter: n => n.structureType == STRUCTURE_CONTROLLER && n.my}
                            )[0]
                            :
                            undefined
                        ]
                    ];
                }
            }
            controllerUpgrade = controllerUpgrade.filter(n => n);

            // harvest
            var harvestEnergySources = []; // job: harvester
            for ( var sourceFlag of _.filter(Game.flags, n => n.color == COLOR_YELLOW ) ) {
                harvestEnergySources = [
                    ...harvestEnergySources,
                    ...[sourceFlag.room
                        ?
                        sourceFlag.pos.findInRange(FIND_SOURCES, 1)[0]
                        :
                        {id: '', pos: sourceFlag.pos}
                    ]
                ];
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
            // --> already utilized resources to be put to use
            // --> creep and creep-team self-management around flags and structures
            // ====================

            // energy logistics
            var transferEnergyStorage = [];             // job: transferrer
            var transferEnergyResourceContainers = [];  // job: transferrer
            var collectEnergyResources = [];            // job: collector
            var collectEnergyDeposits = [];             // job: collector
            var collectEnergyResourcesContainers = [];  // job: collector
            var collectEnergyStorage = [];              // job: collector

            // a lot here may be found with Game.structures in a better way
            for(var hashKey in Game.rooms) { // all Rooms with owned buildings or creeps (activeRooms)
                var activeRoom = Game.rooms[hashKey];
                // job: transferrer
                transferEnergyStorage = [
                    ...transferEnergyStorage,
                    ...activeRoom.find(FIND_MY_STRUCTURES, { filter: n =>
                        ( n.structureType == STRUCTURE_EXTENSION || n.structureType == STRUCTURE_SPAWN) &&
                          n.store.getFreeCapacity(RESOURCE_ENERGY)})
                    ];
                transferEnergyResourceContainers = [
                    ...transferEnergyResourceContainers,
                    // should be checked in all safeRooms (active and resource)
                    ...activeRoom.find(FIND_STRUCTURES, { filter: n =>
                        n.structureType == STRUCTURE_CONTAINER &&
                        n.store.getFreeCapacity(RESOURCE_ENERGY)})
                    ];
                // job: collector
                collectEnergyResources = [
                    ...collectEnergyResources,
                    // should be extended (scout) to more rooms to gather fallen comrades
                    ...activeRoom.find(FIND_DROPPED_RESOURCES, { filter: n =>
                        n.energy})
                    ];
                collectEnergyResourcesContainers = [
                    ...collectEnergyResourcesContainers,
                    ...activeRoom.find(FIND_STRUCTURES, { filter: n =>
                        n.structureType == STRUCTURE_CONTAINER &&
                        n.store[RESOURCE_ENERGY]})
                    ];
                collectEnergyStorage = [
                    ...collectEnergyStorage,
                    // should be checked in active rooms
                    ...activeRoom.find(FIND_MY_STRUCTURES, { filter: n =>
                        ( n.structureType == STRUCTURE_EXTENSION || n.structureType == STRUCTURE_SPAWN ) &&
                          n.store[RESOURCE_ENERGY]})
                    ];
                collectEnergyDeposits = [
                    ...collectEnergyDeposits,
                    // should be extended to more rooms to gather fallen comrades
                    ...activeRoom.find(FIND_TOMBSTONES, { filter: n =>
                        n.store[RESOURCE_ENERGY]})
                    ];
                collectEnergyDeposits = [
                    ...collectEnergyDeposits,
                    // should be extended to more rooms to gather fallen comrades
                    ...activeRoom.find(FIND_RUINS, { filter: n =>
                        n.store[RESOURCE_ENERGY]})
                    ];
            }

            // ====================
            // --byMotivation-- (creep) (let the creep handle this, just give him money / priority)
            // ====================

            // job for an attack leader missing (for a group. the strongest creep with most health, attack and life time, to focus attack and to let weak attackers heal up)
            // jobs for attacker missing (dying of age creeps go kamikaze, grunters become attackers as a group if the enemy is weak)
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
                var priorityFlag =
                    ( n.room && n.pos.lookFor(LOOK_FLAGS).toString() != '' && n.pos.lookFor(LOOK_FLAGS)[0].color == COLOR_CYAN ) ?
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
    }}}
};