import cheerio from 'cheerio'
import pretty from 'pretty'
import {ObjectID} from 'mongodb'
import {setup, teardown} from './setup'

let app
let db
let browser

beforeAll(async () => {
    const res = await setup()
    app = res.app
    db = res.db
    browser = res.browser
})

afterEach(async () => {
    await db.dropDatabase()    
})

afterAll(async () => {
    await teardown({db, app, browser})
})

describe('news', () => {
    it('displays', async () => {
        const browserPage = await browser.createPage()
        const status = await browserPage.open(`http://localhost:3000/news`)
        expect(status).toBe('success')

        const text = await browserPage.property('content')
        const $ = cheerio.load(text)
        const page = $('#__next')
        const html = pretty(page.html())
        expect(html).toMatchSnapshot()
    })

    it('displays read events', async () => {
        const Users = db.collection('users')
        const {insertedId} = await Users.insertOne({
            local: {
                username: 'test'
            },
            reads: [
                {
                    title: 'Test',
                    articleUrl: 'http://example.com/article',
                    videoUrl: 'http://example.com/video',
                }
            ]
        })
        const Events = db.collection('events')
        await Events.insertOne({
            userId: ObjectID(insertedId),
            type: 'created-read',
            date: new Date('2017-08-24T06:52:59.645Z'),
            title: 'Test',
        })
        await Events.insertOne({
            userId: ObjectID(insertedId),
            type: 'reading-read',
            date: new Date('2017-08-24T06:52:59.645Z'),
            title: 'Test',
        })
        await Events.insertOne({
            userId: ObjectID(insertedId),
            type: 'read-read',
            date: new Date('2017-08-24T06:52:59.645Z'),
            title: 'Test',
        })
        await Events.insertOne({
            userId: ObjectID(insertedId),
            type: 'spoke-about-read',
            date: new Date('2017-08-24T06:52:59.645Z'),
            title: 'Test',
        })
        await Events.insertOne({
            userId: ObjectID(insertedId),
            type: 'wrote-about-read',
            date: new Date('2017-08-24T06:52:59.645Z'),
            title: 'Test',
        })
        const browserPage = await browser.createPage()
        const status = await browserPage.open(`http://localhost:3000/news`)
        expect(status).toBe('success')

        const text = await browserPage.property('content')
        const $ = cheerio.load(text)
        const page = $('#__next')
        const html = pretty(page.html())
        expect(html).toMatchSnapshot()
    })
})

