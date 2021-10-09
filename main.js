var ticks_since_game_reset = 0;
var configurations = require('3_2_configurations');
var references = require('8_0_references');
var apis = require('3_0_apis');
var ai = require('3_1_set_up')(configurations, references, apis);
var tests = require('0_1_0_tests')(ai);

module.exports.loop = function main () {
	ai.logger.log('--- ticks since game reset: ' + ++ticks_since_game_reset + ' ---', {level: '6'});
    ai.tick.run();
}
