// internals - tick
module.exports = (tick_version) => {
// nightly version
//    if (tick_version == "1.1") {
//        return (configuration, dependencies, ai) => { return {
//            run: () => {
//                ai.logger.log('this is running');
//            }
//        }}
//    };
// stable version
    if (tick_version == "1.0") {
        return (configuration, dependencies, ai) => { return {
            run: function tick () {
                ai.logger.log('this is running', {level: 6});
            }
        }}
    };
// fallback version
//    if (tick_version == "0.1") {
//        return (configuration, dependencies, ai) => { return {
//            run: () => {
//                ai.logger.log('this is running');
//            }
//        }}
//    };
};