// reference versions - internals
// the latest
module.exports = (configuration, dependencies) => {
    var ai_version = configuration.references_configuration;
    var internals_configuration = {};
    if (ai_version == "1.0") { internals_configuration = {
        logger:         require('0_2_logger')           ('1.0'),
        state:          require('4_1_0_state')          ('1.0'),
        tick:           require('4_2_0_tick')           ('1.0'),
        ai_priorities:  require('4_3_0_ai_priorities')  ('1.0'),
        population:     require('4_4_0_population')     ('1.0'),
        investments:    require('4_5_0_investments')    ('1.0'),
        jobs:           require('4_5_1_jobs')           ('1.0'),
        gui_elements:   require('2_1_0_gui_elements')     ('1.0')
    }};

    // init
    for (const key in internals_configuration) {
        internals_configuration[key] = internals_configuration[key](configuration, dependencies ,internals_configuration);
    };
    return internals_configuration;
};