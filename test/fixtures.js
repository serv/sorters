import {sleep, request} from './utils'

export const generateAndLogUser = async (page, db) => {
    await registerUser(page)
    await setUserData(db)
    await logUser(page)
}

export const registerUser = async (page) => {
    return await request(page, `http://localhost:3000/auth/local/register`, 'POST', {
        email: 'example@example.com',
        password: 'Somepass01',
    })
}

export const logUser = async (page) => {
    return await request(page, `http://localhost:3000/auth/local/login`, 'POST', {
        username: 'example@example.com',
        password: 'Somepass01',
    });
}

export const setUserData = async (db) => {
    const Users = db.collection('users')
    const {insertedId} = await Users.update({
        'local.email': 'example@example.com'
    }, {
        $set: {
            'local.username': 'test',
            profile: {
                name: 'Test User',
                about: 'Test user about',
                bio: 'Test user bio',
                goals: 'Test user goals',
                website: 'http://website',
                blog: 'http://blog',
                youtube: 'http://youtube',
                twitter: 'http://twitter',
                reddit: 'http://reddit',
                patreon: 'http://patreon',
                reading: 'Test user reading',
            },
            reads: [
                {
                    title: 'Read',
                    articleUrl: 'http://example.com/article',
                    videoUrl: 'http://example.com/video',
                },
                {
                    title: 'Read - reading',
                    reading: true,
                },
                {
                    title: 'Read - read',
                    read: true,
                },
            ],
            goals: [
                {
                    title: 'Goal',
                },
                {
                    title: 'Goal - doing',
                    doing: true,
                },
                {
                    title: 'Goal - done',
                    done: true,
                },
            ],
        }
    })
}