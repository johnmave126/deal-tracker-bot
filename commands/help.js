module.exports = {
    name: '!help',
    description: '!help: show all the available commands and usages.',
    execute(msg, args) {
        if(args.length !== 0) {
            msg.reply(`Expect no argument, got ${args.length}`);
            return;
        }
        const commands = require('./index');
        console.log(commands);
        const helps = Object.values(commands).map(v => v.description);
        msg.reply(["Supported Commands:", ...helps], {split: true});
    }
};