// reference versions - internals
// the latest
module.exports = (configuration, dependencies) => {
    var ai_version = configuration.references_configuration;
    var internals_configuration = {};
// nightly,
//    if (ai_version == "1.1") { internals_configuration = {
//        logger: require('0_2_logger')('1.0'),
//        tick: require('4_1_0_tick')('1.0'),
//        ai_priorities: require('4_2_0_ai_priorities')('1.0')
//    }};
// stable and
    if (ai_version == "1.0") { internals_configuration = {
        logger: require('0_2_logger')('1.0'),
        tick: require('4_1_0_tick')('1.0'),
        ai_priorities: require('4_2_0_ai_priorities')('1.0')
    }};
// fallback version configuration
//    if (ai_version == "0.1") { internals_configuration = {
//        logger: require('0_2_logger')('1.0'),
//        tick: require('4_1_0_tick')('1.0'),
//        ai_priorities: require('4_2_0_ai_priorities')('1.0')
//    }};
// init
    for (const key in internals_configuration) {
        internals_configuration[key] = internals_configuration[key](configuration, dependencies ,internals_configuration);
    };
    return internals_configuration;
};