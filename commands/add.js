const checkers = require('../checkers');
const { collection } = require('../db');
const { MongoError } = require('mongodb');

module.exports = {
    name: '!add',
    description: '!add url: track information for the item at url',
    async execute(msg, args) {
        if(args.length !== 1) {
            msg.reply(`Expect 1 argument, got ${args.length}`);
            return;
        }
        if(msg.channel.type !== 'dm') {
            msg.reply(`Currently only direct message is supported`);
        }
        const url = (() => { try { return new URL(args[0]); } catch(e) { return undefined; } })();
        if(!url) {
            msg.reply(`Invalid URL`);
            return;
        }
        if(url.protocol !== 'http:' && url.protocol !== 'https:') {
            msg.reply(`Invalid URL protocol`);
            return;
        }
        const checker = checkers.find(handler => handler.validate(url));
        if(!checker) {
            msg.reply(`Unsupported site. Use !support to find the list of site currently supported`);
            return;
        }
        
        try {
            const item_info = await checker.extract(url);
            // Insert product if it doesn't exist
            await collection('items').updateOne({ url: url.href }, {
                $setOnInsert: {
                    title: item_info.title,
                    price: item_info.price,
                    status: item_info.status
                }
            }, { upsert: true });

            // Add user to subscriber if appropriate
            try {
                await collection('subscriptions').insertOne({
                    url: url.href,
                    dm_subscriber: msg.author.tag
                });
            }
            catch(e) {
                if(e instanceof MongoError && e.code === 11000) {
                    msg.reply(`You've already subscribed to this item!`);
                    return;
                }
                else {
                    throw e;
                }
            }
            msg.reply(`Item "${item_info.title}" tracked\nCurrent price: ${item_info.price}\nCurrent status: ${item_info.status}`);
        }
        catch(e) {
            if(e instanceof String) {
                msg.reply(reason);
            }
            else {
                throw e;
            }
        }
    }
};
