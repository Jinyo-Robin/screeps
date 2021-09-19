// reference versions
module.exports = function references (configuration) {
    var dependencies = require('8_2_externals_versions')(configuration);
    var ai = require('8_1_internals_versions')(configuration, dependencies);
    ai.logger.log('references_configuration [' + configuration.references_configuration + '] loaded');
    return ai;
};