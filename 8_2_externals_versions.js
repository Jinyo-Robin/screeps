// reference versions - externals
// the latest
module.exports = (configuration) => {
    var ai_version = configuration.references_configuration;
// nightly,
    if (ai_version == "1.1") { return {

    }};
// stable and
    if (ai_version == "1.0") { return {

    }};
// fallback version configuration
    if (ai_version == "0.1") { return {

    }};
};