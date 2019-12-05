const { MongoClient } = require('mongodb');

let db;

module.exports = {
    async connect() {
        try {
            const client = await MongoClient.connect(process.env.MONGOD_URI, {
                useUnifiedTopology: true
            });
            db = client.db();
        }
        catch(e) {
            console.error(e);
            process.exit(1);
        }
    },
    getDb() {
        return db;
    },
    collection(name) {
        return db.collection(name);
    }
};
