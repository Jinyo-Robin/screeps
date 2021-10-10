var icons = {
	freebee: ' ❓️ freebee:',
	collector: '🔄 collect',
	transferrer: '📦 transfer',
	builder: '🚧️ build',
	harvester:'🌾️ harvest',
	upgrader: '✨ upgrade'
};

// investments
module.exports = function investments (investments_version) {
    if (investments_version == '1.0') {
        return (configuration, externals, ai) => { return {
            run: function() {
                for(var name in Game.creeps) {
                    var creep = Game.creeps[name];
                    // finish current job
                    if(creep.memory.job != 'freebee') {
                        ai.jobs[creep.memory.job].run(creep);
                    }
                    // get most rewarding job, if nothing to to
                    if(creep.memory.job == 'freebee') {
                        if(creep.store.getFreeCapacity() == 0){
                            var actionTasks = Memory.tasks
                                .filter(n => ['builder', 'transferrer' /*, 'repairer' */ ].includes(n.job))
                                .sort((a, b) => (b.priority - b.ref.pos.getRangeTo(creep)) - (a.priority - a.ref.pos.getRangeTo(creep)));
                            if(actionTasks.length){
                                creep.memory.job = actionTasks[0].job;
                                creep.say(icons[creep.memory.job]);
                                ai.jobs[creep.memory.job].run(creep);
                            }
                        } else if(creep.store[RESOURCE_ENERGY]){
                            var allTasks = Memory.tasks
                                .filter(n => ['builder', 'transferrer' /*, 'repairer' */, 'collector'].includes(n.job))
                                .sort((a, b) => (b.priority - b.ref.pos.getRangeTo(creep)) - (a.priority - a.ref.pos.getRangeTo(creep)));
                            if(allTasks.length){
                                creep.memory.job = allTasks[0].job;
                                creep.say(icons[creep.memory.job]);
                                ai.jobs[creep.memory.job].run(creep);
                            }
                        } else if(!creep.store[RESOURCE_ENERGY]){
                            var gatherTasks = Memory.tasks
                                .filter(n => n.job == 'collector')
                                .sort((a, b) => (b.priority - b.ref.pos.getRangeTo(creep)) - (a.priority - a.ref.pos.getRangeTo(creep)));
                            if(gatherTasks.length){
                                creep.memory.job = gatherTasks[0].job;
                                creep.say(icons[creep.memory.job]);
                                ai.jobs[creep.memory.job].run(creep);
                            }
                        } else {
                            creep.memory.job = 'collector';
                            creep.say(icons[creep.memory.job]);
                            ai.jobs[creep.memory.job].run(creep);
                        }
                    }
                }
            }
        }}
    } else {
         ai.logger.log('version not available');
     }
};