module.exports = (version, configuration, externals) => {
    if (version == "1.0") { return {
        log: (level, content) => {
            if (level <= configuration.log_level) {
                console.log(content);
            };
        }
    }};
};