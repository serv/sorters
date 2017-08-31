import cheerio from 'cheerio'
import pretty from 'pretty'
import {MongoClient, ObjectID} from 'mongodb'
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

afterAll(async () => {
    await db.close()

    await new Promise((resolve, reject) => {
        app.on('close', () => {
            resolve()
        })
        try {
            process.kill(-app.pid)
        } catch (e) {
            console.log(e)
        }
    })
})

describe('login', () => {
    it('displays', async () => {
        const browserPage = await browser.createPage()
        const status = await browserPage.open(`http://localhost:3000/login`)
        expect(status).toBe('success')

        const text = await browserPage.property('content')
        const $ = cheerio.load(text)
        const page = $('#__next')
        const html = pretty(page.html())
        expect(html).toMatchSnapshot()
    })
})
