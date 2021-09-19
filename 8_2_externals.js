// reference versions - externals
// the latest
module.exports = (configuration) => {
    var version = configuration.references_versions_configuration;
// nightly,
    if (version == "1.1") { return {

    }};
// stable and
    if (version == "1.0") { return {

    }};
// fallback version configuration
    if (version == "0.1") { return {

    }};
};