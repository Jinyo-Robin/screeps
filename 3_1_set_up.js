// control via api - set up
//
// To set up external control you can:
module.exports = (configurations, references, interfaces, notifications) => {
// - set another configuration
    references(configurations.casual).ai_priorities.run(); //(configurations.casual);
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