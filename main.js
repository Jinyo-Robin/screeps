var managers = require('managers');

module.exports.loop = function () {
	
	// for(var flagHash in Game.flags){ Game.flags[flagHash].remove();}
	
	managers.priorities.run();
	managers.population.run();
	managers.investments.run();
	managers.manuals.run();
}