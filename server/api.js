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
    const Posts = db.collection('posts')
    const Comments = db.collection('comments')

    const typeDefs = [`
        type User {
            _id: ID!
            active: Boolean
            local: UserLocal
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
        }
        type Read {
            title: String!
            read: Boolean
            articleUrl: String
            videoUrl: String
        }
        type Post {
            _id: ID!
            authorId: ID!
            title: String
            content: String

            author: User
            comments: [Comment]!
        }
        type Comment {
            _id: ID!
            postId: ID!
            authorId: ID
            content: String

            author: User
            post: Post
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
            post(_id: ID!): Post
            posts: [Post]
            comment(_id: ID!): Comment
        }
        type Mutation {
            updateProfile(profile: ProfileInput): User
            updateReads(reads: [ReadInput]!): User
            createRead(read: NewReadInput!): User
            createPost(title: String, content: String): Post
            createComment(postId: ID!, content: String): Comment
            activateProfile(code: String): Boolean
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
            post: async (root, {_id}) => {
                return prepare(await Posts.findOne(ObjectId(_id)))
            },
            posts: async (root, args, context) => {
                return (await Posts.find({}).toArray()).map(prepare)
            },
            comment: async (root, {_id}) => {
                return prepare(await Comments.findOne(ObjectId(_id)))
            },
            users: async (root, args, context) => {
                return (await Users.find({
                    active: true,
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
                    active: true,
                    'local.username': username
                }))
            }
        },
        Post: {
            comments: async ({_id}) => {
                return (await Comments.find({postId: _id}).toArray()).map(prepare)
            }
        },
        Comment: {
            post: async ({postId}) => {
                return prepare(await Posts.findOne(ObjectId(postId)))
            }
        },
        Mutation: {
            activateProfile: async (root, {code}, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                if (code !== 'DBKUZ8FY') {
                    throw new Error('Invalid code.')
                }
                await Users.update({
                    _id: ObjectId(userId)
                }, {
                    $set: {
                        active: true
                    }
                });
            },
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
            createPost: async (root, args, {userId}, info) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                args.authorId = userId
                const _id = (await Posts.insertOne(args)).insertedId
                return prepare(await Posts.findOne(ObjectId(_id)))
            },
            createComment: async (root, args, {userId}) => {
                if (!userId) {
                    throw new Error('User not logged in.')
                }
                args.authorId = userId
                const _id = (await Comments.insertOne(args)).insertedId
                return prepare(await Comments.findOne(ObjectId(_id)))
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