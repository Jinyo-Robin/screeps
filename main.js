// var managers = require('managers');
var ticks_since_game_reset = 0;
var configurations = require('3_2_configurations');
var references = require('8_0_references');
var apis = require('3_0_apis');
var ai = require('3_1_set_up')(configurations, references, apis);

module.exports.loop = function main () {
	ai.logger.log('--- ticks since game reset: ' + ++ticks_since_game_reset + ' ---', {level: '6'});
    ai.tick.run();
	// for(var flagHash in Game.flags){ Game.flags[flagHash].remove();}
	// managers.priorities.run();
	// managers.population.run();
	// managers.investments.run();
	// managers.manuals.run();
}