module.exports = (gui_elements_version) => {
    if (gui_elements_version == "1.0") { return (configuration, dependencies, ai) => { return {
        run: function gui_elements () {

            if(ai.state.GUI) {
                Game.spawns['Spawn1'].room.visual.text(
                    ' ⚡ ' + ai.state.energyResourcesAmount + ' / ' + ai.state.energyResourcesCap + '  | ' +
                    ' 🛠 ' + _.filter(Game.creeps, creep => true).length + ' / ' + ai.state.workerscap,
                    48, 47, {align: 'right', opacity: configuration.gui_elements.opacity});
                Game.spawns['Spawn1'].room.visual.text(
                    '   (⚡ ' + ai.state.energyResourcesDropped + ')   |' +
                    '   ( ❓ ' + _.filter(Game.creeps, creep => creep.memory.job == 'freebee').length + ')' +
                    '   (🔄 ' + _.filter(Game.creeps, creep => creep.memory.job == 'collector').length + ')' +
                    '   (📦 ' + _.filter(Game.creeps, creep => creep.memory.job == 'transferrer').length + ')' +
                    '   (🚧️ ' + _.filter(Game.creeps, creep => creep.memory.job == 'builder').length + ')' +
                    '   (🌾️ ' + _.filter(Game.creeps, creep => creep.memory.job == 'harvester').length + ')' +
                    '   (✨ ' + _.filter(Game.creeps, creep => creep.memory.job == 'upgrader').length + ')',
                    48, 48, {align: 'right', opacity: configuration.gui_elements.opacity});
            }

            // jobs list ("Black Board")
            if(ai.state.GUI) {
                var tablePosition = {x: 1, y: 2};
                var tableWidths = [4, 2, 7];
                Memory.tasks.sort((a, b) => b.priority - a.priority);
                    Game.spawns['Spawn1'].room.visual.text(
                        'job ' + Memory.tasks.length,
                            tablePosition.x,
                            tablePosition.y -1,
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        'prio',
                            tablePosition.x + tableWidths[0],
                            tablePosition.y -1,
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        'pos',
                            tablePosition.x + tableWidths[0] + tableWidths[1],
                            tablePosition.y -1,
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        'ref',
                            tablePosition.x + tableWidths[0] + tableWidths[1] + tableWidths[2],
                            tablePosition.y -1,
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                for(var nr in Memory.tasks){
                    Game.spawns['Spawn1'].room.visual.text(
                        Memory.tasks[nr].job,                                   // job
                            tablePosition.x,
                            tablePosition.y + parseInt(nr),
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        Math.floor(Memory.tasks[nr].priority),                  // prio
                            tablePosition.x + tableWidths[0] + tableWidths[1] -1,
                            tablePosition.y + parseInt(nr),
                            {align: 'right', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        Memory.tasks[nr].ref.pos.toString().substring(6,25),    // pos
                            tablePosition.x + tableWidths[0] + tableWidths[1],
                            tablePosition.y + parseInt(nr),
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        Memory.tasks[nr].ref.toString().substring(0,25),        //ref
                            tablePosition.x + tableWidths[0] + tableWidths[1] + tableWidths[2],
                            tablePosition.y + parseInt(nr),
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                }
            }

            // jobs list ("Black Board")
            if(ai.state.GUI) {
                var tablePosition = {x: 1, y: 32};
                var tableWidths = [4, 2, 7];
                    Game.spawns['Spawn1'].room.visual.text(
                        'job ' + Memory.tasks.length,
                            tablePosition.x,
                            tablePosition.y -1,
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        'prio',
                            tablePosition.x + tableWidths[0],
                            tablePosition.y -1,
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        'pos',
                            tablePosition.x + tableWidths[0] + tableWidths[1],
                            tablePosition.y -1,
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        'ref',
                            tablePosition.x + tableWidths[0] + tableWidths[1] + tableWidths[2],
                            tablePosition.y -1,
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                for(var nr in Memory.tasks){
                    Game.spawns['Spawn1'].room.visual.text(
                        Memory.tasks[nr].job,                                   // job
                            tablePosition.x,
                            tablePosition.y + parseInt(nr),
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        Math.floor(Memory.tasks[nr].priority),                  // prio
                            tablePosition.x + tableWidths[0] + tableWidths[1] -1,
                            tablePosition.y + parseInt(nr),
                            {align: 'right', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        Memory.tasks[nr].ref.pos.toString().substring(6,25),    // pos
                            tablePosition.x + tableWidths[0] + tableWidths[1],
                            tablePosition.y + parseInt(nr),
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                    Game.spawns['Spawn1'].room.visual.text(
                        Memory.tasks[nr].ref.toString().substring(0,25),        //ref
                            tablePosition.x + tableWidths[0] + tableWidths[1] + tableWidths[2],
                            tablePosition.y + parseInt(nr),
                            {align: 'left', opacity: configuration.gui_elements.opacity});
                }
            }

            if(Game.spawns['Spawn1'].spawning) {
                var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
                Game.spawns['Spawn1'].room.visual.text(
                    '🛠' + spawningCreep.memory.job,
                    Game.spawns['Spawn1'].pos.x + 1,
                    Game.spawns['Spawn1'].pos.y,
                    {align: 'left', opacity: configuration.gui_elements.opacity});
            }
        }
    }}}
};