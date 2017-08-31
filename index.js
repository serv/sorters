const settings = require('./settings')
const start = require('./server/server')
const dev = process.env.NODE_ENV !== 'prod'

if (process.env.MONGO_URL) {
    settings.mongoUrl = process.env.MONGO_URL
}

start(settings, dev)
