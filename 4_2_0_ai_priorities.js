// ai priorities
module.exports = function ai_priorities (ai_priorities_version) {
    if (ai_priorities_version == '1.0') {
        return (configuration, externals, ai) => { return {
            run: function run (args = {}) {}
        }}
    }
};