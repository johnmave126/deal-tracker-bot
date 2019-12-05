module.exports = {
    name: '!test',
    description: '!test: display info in the console.',
    execute(msg, args) {
        console.log(msg);
        console.log(args);
        msg.reply("ACK");
    }
};
