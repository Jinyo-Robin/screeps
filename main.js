// var managers = require('managers');

var set_up = require('3_1_set_up');
var configurations = require('3_2_configurations');
var interfaces = require('3_3_interfaces_versions');
var notifications = require('3_4_notifications_versions');
var references = require('8_0_references_versions');

module.exports.loop = function () {
	console.log(Game.time);
	// set_up(configurations, references, interfaces, notifications);
	// for(var flagHash in Game.flags){ Game.flags[flagHash].remove();}
	// managers.priorities.run();
	// managers.population.run();
	// managers.investments.run();
	// managers.manuals.run();
}