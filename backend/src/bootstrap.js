const mongoose = require('mongoose');

const mongoHost = process.env.MONGO_HOST || 'mongodb'

mongoose.connect(`mongodb://${mongoHost}:27017/quovote`, { useNewUrlParser: true, useUnifiedTopology: true });
