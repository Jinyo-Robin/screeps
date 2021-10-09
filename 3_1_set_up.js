// control via api - set up

// To set up external control you can:

module.exports = function set_up (configurations, references, apis) {
// - set another configuration
    var configuration = 'CASUAL';

    var ai = references(configurations[configuration]);
    ai.logger.log('ai configuration (' + configuration + ') initialized');

//  var api = apis(configurations[configuration], ai);
//  ai.logger.log('api configuration (' + configuration + ') initialized');

// - register one-time commands, goals, and state via interfaces --- eg.:
//  api.interfaces.register([
//      {uid:'lahb-ersl', command: "attack(args[])", repeat-delay:'1000'}
//  ]);

// - register for feedback via notifications --- eg.:
//  api.notifications.register([
//      {uid: 'sdfm-ftzt', event: 'danger', callback: () => {}}
//  ]);

    return ai;
};