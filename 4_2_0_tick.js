// internals - tick
module.exports = (tick_version) => {
    if (tick_version == "1.0") { return (configuration, dependencies, ai) => { return {
        run: function tick () {
            ai.logger.log('this is running', {level: 6});
            // for(var flagHash in Game.flags){ Game.flags[flagHash].remove();}
            ai.ai_priorities.run();
            ai.population.run();
            ai.investments.run();
            ai.gui_elements.run();
        }
    }}}
};