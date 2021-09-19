// reference versions
module.exports = (configuration) => {
    var externals = require('8_2_externals')(configuration);
    var internals = require('8_1_internals')(configuration, externals);
    var logger = internals.logger;
    logger.log(1, 'game time: ' + Game.time);
    logger.log(2, 'references_versions_configuration: ' + configuration.references_versions_configuration);
    return internals;
};
