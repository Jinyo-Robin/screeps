// reference versions - internals
// the latest
module.exports = (configuration, externals) => {
    var version = configuration.references_versions_configuration;
// nightly,
    if (version == "1.1") { return {
        logger: require('0_2_logger')('1.0', configuration, externals),
        ai_priorities: require('4_0_ai_priorities')('1.0', configuration, externals)
    }};
// stable and
    if (version == "1.0") { return {
        logger: require('0_2_logger')('1.0', configuration, externals),
        ai_priorities: require('4_0_ai_priorities')('1.0', configuration, externals)
    }};
// fallback version configuration
    if (version == "0.1") { return {
        logger: require('0_2_logger')('1.0', configuration, externals),
        ai_priorities: require('4_0_ai_priorities')('1.0', configuration, externals)
    }};
};