// logger
module.exports = function logger (logger_version) {
    if (logger_version == "1.0") {
        return (configuration, externals, ai) => { return {
            log: function logger (content, args = {level: 1}) {
                if (args.level <= configuration.log_level) {
                    console.log('[' + Game.time + ', ' + logger.caller.name + '.js] ' + new Array(14 - logger.caller.name.length).join(' ') + content);
                };
            }
        }}
    };
};