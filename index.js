const { Client, Collection } = require('discord.js');
const { schedule } = require('node-cron');

const { connect: dbConnect, collection } = require('./db');
const checkers = require('./checkers');

const commands = require('./commands');

const bot = new Client();

bot.commands = new Collection();
Object.values(commands).map(v => {
    bot.commands.set(v.name, v);
});

function is_numeric_same(a, b) {
    return a.toString() === b.toString();
}

function check_items() {
    collection('items').find({}).forEach(async (item) => {
        const url = new URL(item.url);
        const checker = checkers.find(handler => handler.validate(url));
        const item_info = await checker.extract(url);
        if(is_numeric_same(item_info.price, item.price) && item_info.status === item.status) {
            return;
        }
        const msg = [`The item "${item.title}" you tracked has changed!`];
        if(!is_numeric_same(item_info.price, item.price)) {
            msg.push(`Price: ${item.price} -> ${item_info.price}`);
        }
        else {
            msg.push(`Price: ${item.price}`);
        }
        if(item_info.status !== item.status) {
            msg.push(`Status: ${item.status} -> ${item_info.status}`);
        }
        else {
            msg.push(`Status: ${item.status}`);
        }
        msg.push(`Item page: ${item.url}`);
        collection('subscriptions').find({
            url: item.url
        }).forEach((subscription) => {
            console.log(subscription);
            const subscriber = bot.users.find(user => user.tag == subscription.dm_subscriber);
            console.log(subscriber);
            if(subscriber) {
                subscriber.send(msg, {split: true});
            }
        });
        collection('items').updateOne({
            url: item.url
        }, {
            $set: item_info
        });
    }).catch((e) => console.error(e));
}


bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);

    check_items();
    schedule('*/30 * * * *', check_items);
});

bot.on('message', msg => {
    const args = msg.content.split(/ +/);
    const command = args.shift().toLowerCase();

    if (bot.commands.has(command)) {
        try {
            bot.commands.get(command).execute(msg, args);
        } catch (error) {
            console.error(error);
            msg.reply('There was an error trying to execute that command!');
        }
    }
});

dbConnect().then(async () => {
    try {
        await collection('items').createIndexes([
            {key: {url: 1}, name: 'url', unique: true}
        ]);
        await collection('subscriptions').createIndexes([
            {key: {url: 1, dm_subscriber: 1}, name: 'url_subscriber', unique: true}
        ]);
    }
    catch(error) {
        console.error(error);
        process.exit(1);
    }
    bot.login(process.env.DISCORD_TOKEN);
});
