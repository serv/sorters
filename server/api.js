const {MongoClient, ObjectId} = require('mongodb')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const {makeExecutableSchema} = require('graphql-tools')
const morgan = require('morgan')
const cors = require('cors')
const nodeify = require('nodeify')
const ooth = require('./ooth')
const crypto = require('crypto-browserify')

const prepare = (o) => {
    if (o && o._id) {
        o._id = o._id.toString()
    }
    return o
}

function nodeifyAsync(asyncFunction) {
    return function(...args) {
        return nodeify(asyncFunction(...args.slice(0, -1)), args[args.length-1])
    }
}

const start = async (app, settings) => {
    const db = await MongoClient.connect(settings.mongoUrl)

    const Users = db.collection('users')

    const typeDefs = [`
        type User {
            _id: ID!
            local: UserLocal
            emailHash: String
            profile: Profile
            reads: [Read]
        }
        type UserLocal {
            username: String
        }
        type Profile {
            name: String
            about: String
            bio: String
            goals: String
            website: String
            blog: String
            youtube: String
            twitter: String
            reddit: String
            patreon: String
            reading: String
        }
        type Read {
            title: String!
            read: Boolean
            articleUrl: String
            videoUrl: String
        }
        input ProfileInput {
            name: String
            about: String
            bio: String
            goals: String
            website: String
            blog: String
            youtube: String
            twitter: String
            reddit: String
            patreon: String
        }
        input ReadInput {
            title: String!
            read: Boolean
            articleUrl: String
            videoUrl: String
        }
        input NewReadInput {
            title: String!
        }

        type Query {
            me: User
            user(_id: ID!): User
            userByUsername(username: String!): User
            users: [User]
        }
        type Mutation {
            updateProfile(profile: ProfileInput): User
            updateReading(reading: String): User
            updateReads(reads: [ReadInput]!): User
            createRead(read: NewReadInput!): User
        }

        schema {
            query: Query
            mutation: Mutation
        }
    `];

    const resolvers = {
        Query: {
            me: async (root, args, {userId}) => {
                if (!userId) {
                    return null
                }
                return prepare(await Users.findOne(ObjectId(userId)));
            },
            users: async (root, args, context) => {
                return (await Users.find({
                    'local.username': {
                        $exists: true
                    }
                }, {
                    sort: {
                        'local.username': 1
                    }
                }).toArray()).map(prepare)
            },
            userByUsername: async (root, {username}, {userId}) => {
                return prepare(await Users.findOne({
                    'local.username': username
                }))
            }
        },
        User: {
            emailHash: async (user) => {
                if (user.local && user.local.email) {
                    const email = user.local.email
                    return crypto.createHash('md5').update(email).digest("hex")
                }
            }
        },
        Mutation: {
            updateProfile: async (root, {profile}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                await Users.update({
                    _id: ObjectId(userId)
                }, {
                    $set: {
                        profile
                    }
                });
                return prepare(await Users.findOne(ObjectId(userId)));
            },
            updateReading: async (root, {reading}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                await Users.update({
                    _id: ObjectId(userId)
                }, {
                    $set: {
                        'profile.reading': reading
                    }
                });
                return prepare(await Users.findOne(ObjectId(userId)));
            },
            updateReads: async (root, {reads}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                await Users.update({
                    _id: ObjectId(userId)
                }, {
                    $set: {
                        reads
                    }
                });
                return prepare(await Users.findOne(ObjectId(userId)));
            },
            createRead: async (root, {read}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                await Users.update({
                    _id: ObjectId(userId)
                }, {
                    $push: {
                        reads: read
                    }
                });
                return prepare(await Users.findOne(ObjectId(userId)));
            },
        },
    }

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    })

    app.use(morgan('dev'))

    const corsMiddleware = cors({
        origin: settings.originUrl,
        credentials: true,
        preflightContinue: false
    })
    app.use(corsMiddleware)
    app.options(corsMiddleware)

    app.use(session({
        name: 'api-session-id',
        secret: settings.sessionSecret,
        resave: false,
        saveUninitialized: true,
    }))
    await ooth(app, settings)

    app.use('/graphql', bodyParser.json(), graphqlExpress((req, res) => {
        return {
            schema,
            context: { userId: req.user && req.user._id }
        }
    }))

    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
    }))
}

module.exports = {
    start
}