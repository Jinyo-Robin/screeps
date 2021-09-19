// control via api
module.exports = function apis (configuration) {
    var dependencies = require('8_2_externals')(configuration);
    var ai = require('8_1_internals')(configuration, dependencies);
    ai.logger.log(1, 'game time: ' + Game.time);
    ai.logger.log(2, 'references_versions_configuration: ' + configuration.references_versions_configuration);
    return ai;
};