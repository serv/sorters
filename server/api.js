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
const {GraphQLScalarType} = require('graphql')

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
    const Events = db.collection('events')

    const typeDefs = []
    typeDefs.push(`
        scalar Date
        type User {
            _id: ID!
            local: UserLocal
            emailHash: String
            profile: Profile
            reads: [Read]
            goals: [Goal]
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
            reading: Boolean
            read: Boolean
            articleUrl: String
            videoUrl: String
        }
        type Goal {
            title: String!
            description: String
            doing: Boolean
            done: Boolean
        }

        interface Event {
            _id: ID!
            userId: ID!
            user: User!
            type: String!
            date: Date!
        }
        type UpdatedProfile implements Event {
            _id: ID!
            userId: ID!
            user: User!
            type: String!
            date: Date!
        }
        type UpdatedRead implements Event {
            _id: ID!
            userId: ID!
            user: User!
            type: String!
            date: Date!
            title: String!
            read: Read
        }
        type UpdatedGoal implements Event {
            _id: ID!
            userId: ID!
            user: User!
            type: String!
            date: Date!
            title: String!
            goal: Goal
        }
        input ProfileInput {
            name: String
            about: String
            bio: String
            website: String
            blog: String
            youtube: String
            twitter: String
            reddit: String
            patreon: String
        }
        input ReadInput {
            title: String!
            reading: Boolean
            read: Boolean
            articleUrl: String
            videoUrl: String
        }
        input NewReadInput {
            title: String!
        }
        input GoalInput {
            title: String!
            description: String
            doing: Boolean
            done: Boolean
        }
        input NewGoalInput {
            title: String!
        }

        type Query {
            me: User
            user(_id: ID!): User
            userByUsername(username: String!): User
            users: [User!]!
            events: [Event!]!
        }
        type Mutation {
            updateProfile(profile: ProfileInput): User
            updateReading(reading: String): User
            updateReads(reads: [ReadInput]!): User
            createRead(read: NewReadInput!): User
            updateGoalsDescription(goals: String): User
            updateGoals(goals: [GoalInput]!): User
            createGoal(goal: NewGoalInput!): User
        }

        schema {
            query: Query
            mutation: Mutation
        }
    `);

    const resolvers = {
        Date: new GraphQLScalarType({
            name: 'Date',
            description: 'Date',
            parseValue(value) {
                return new Date(value);
            },
            serialize(value) {
                return value.getTime();
            },
            parseLiteral(ast) {
                if (ast.kind === Kind.INT) {
                    return parseInt(ast.value, 10);
                }
                return null;
            },
        }),
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
            },
            events: async (root, params, context) => {
                return (await Events.find({}, {
                    sort: {
                        date: -1
                    },
                    limit: 200,
                }).toArray()).map(prepare)
            },
        },
        User: {
            emailHash: async (user) => {
                if (user.local && user.local.email) {
                    const email = user.local.email
                    return crypto.createHash('md5').update(email).digest("hex")
                }
            }
        },
        Event: {
            __resolveType({type}, context, info) {
                return {
                    'updated-profile': 'UpdatedProfile',
                    'created-read': 'UpdatedRead',
                    'reading-read': 'UpdatedRead',
                    'read-read': 'UpdatedRead',
                    'spoke-about-read': 'UpdatedRead',
                    'wrote-about-read': 'UpdatedRead',
                    'created-goal': 'UpdatedGoal',
                    'doing-goal': 'UpdatedGoal',
                    'done-goal': 'UpdatedGoal',
                }[type]
            },
        },
        UpdatedProfile: {
            user: async ({userId}) => {
                return prepare(await Users.findOne(ObjectId(userId)))
            },
        },
        UpdatedRead: {
            user: async ({userId}) => {
                return prepare(await Users.findOne(ObjectId(userId)))
            },
            read: async ({userId, title}) => {
                const user = await Users.findOne(ObjectId(userId))
                if (user.reads) {
                    return user.reads.find(r => r.title === title)
                }
            },
        },
        UpdatedGoal: {
            user: async ({userId}) => {
                return prepare(await Users.findOne(ObjectId(userId)))
            },
            goal: async ({userId, title}) => {
                const user = await Users.findOne(ObjectId(userId))
                if (user.goals) {
                    return user.goals.find(r => r.title === title)
                }
            },
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
                await Events.insert({
                    userId,
                    type: 'updated-profile',
                    date: new Date(),
                })
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
                await Events.insert({
                    userId,
                    type: 'updated-profile',
                    date: new Date(),
                })
                return prepare(await Users.findOne(ObjectId(userId)));
            },
            updateReads: async (root, {reads}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                const user = await Users.findOne(ObjectId(userId))
                const userReads = user.reads || []
                for (const read of reads) {
                    const title = read.title
                    const oldRead = userReads.find(r => r.title === read.title)
                    if (!oldRead) {
                        await Events.insert({
                            userId,
                            type: 'created-read',
                            title,
                            date: new Date(),
                        })
                    } else {
                        if (!oldRead.reading && read.reading) {
                            await Events.insert({
                                userId,
                                type: 'reading-read',
                                title,
                                date: new Date(),
                            })
                        }
                        if (!oldRead.read && read.read) {
                            await Events.insert({
                                userId,
                                type: 'read-read',
                                title,
                                date: new Date(),
                            })
                        }
                        if (!oldRead.articleUrl && read.articleUrl) {
                            await Events.insert({
                                userId,
                                type: 'wrote-about-read',
                                title,
                                date: new Date(),
                            })
                        }
                        if (!oldRead.videoUrl && read.videoUrl) {
                            await Events.insert({
                                userId,
                                type: 'spoke-about-read',
                                title,
                                date: new Date(),
                            })
                        }
                    }
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
                const user = await Users.findOne(ObjectId(userId))
                if (user.reads) {
                    if (user.reads.some(r => r.title === read.title)) {
                        throw new Error('You already created this read.')
                    }
                }
                await Users.update({
                    _id: ObjectId(userId)
                }, {
                    $push: {
                        reads: read
                    }
                })
                await Events.insert({
                    userId,
                    type: 'created-read',
                    date: new Date(),
                    title: read.title,
                })
                return prepare(await Users.findOne(ObjectId(userId)));
            },
            updateGoalsDescription: async (root, {goals}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                await (Users.update({
                    _id: ObjectId(userId)
                }, {
                    $set: {
                        'profile.goals': goals
                    }
                }));
                await Events.insert({
                    userId,
                    type: 'updated-profile',
                    date: new Date(),
                })
                return prepare(await Users.findOne(ObjectId(userId)));
            },
            updateGoals: async (root, {goals}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                const user = await Users.findOne(ObjectId(userId))
                const userGoals = user.goals || []
                for (const goal of goals) {
                    const title = goal.title
                    const oldGoal = userGoals.find(g => g.title === goal.title)
                    if (!oldGoal) {
                        await Events.insert({
                            userId,
                            type: 'created-goal',
                            title,
                            date: new Date(),
                        })
                    } else {
                        if (!oldGoal.doing && goal.doing) {
                            await Events.insert({
                                userId,
                                type: 'doing-goal',
                                title,
                                date: new Date(),
                            })
                        }
                        if (!oldGoal.done && goal.done) {
                            await Events.insert({
                                userId,
                                type: 'done-goal',
                                title,
                                date: new Date(),
                            })
                        }
                    }
                }                
                await Users.update({
                    _id: ObjectId(userId)
                }, {
                    $set: {
                        goals
                    }
                });
                return prepare(await Users.findOne(ObjectId(userId)));
            },
            createGoal: async (root, {goal}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                const user = await Users.findOne(ObjectId(userId))
                if (user.goals) {
                    if (user.goals.some(g => g.title === goal.title)) {
                        throw new Error('You already created this goal.')
                    }
                }
                await Users.update({
                    _id: ObjectId(userId)
                }, {
                    $push: {
                        goals: goal
                    }
                })
                await Events.insert({
                    userId,
                    type: 'created-goal',
                    date: new Date(),
                    title: goal.title,
                })
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