// control via api - set up
//
// To set up external control you can:
module.exports = function set_up (configurations, references, apis) {
// - set another configuration
    var ai = references(configurations.casual);
    ai.logger.log('ai initialized');
    return ai; //(configurations.casual);
// - register one-time commands, goals, and state via interfaces
// --- eg.:
//  interfaces.register([
//      {uid:'lahb-ersl', command: "attack(args[])", repeat-delay:'1000'}
//  ]);
// - register for feedback via notifications
// --- eg.:
//  notifications.register([
//      {uid: 'sdfm-ftzt', event: 'danger', callback: () => {}}
//  ]);
};