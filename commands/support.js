const checkers = require('../checkers');

module.exports = {
    name: '!support',
    description: '!support: show the list of supported sites.',
    execute(msg, args) {
        if(args.length !== 0) {
            msg.reply(`Expect no argument, got ${args.length}`);
            return;
        }
        const sites = checkers.map(site => `${site.name}: ${site.homepage}`);
        msg.reply(["Supported Sites:", ...sites], {split: true});
    }
};
