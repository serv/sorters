import cheerio from 'cheerio'
import pretty from 'pretty'
import {ObjectID} from 'mongodb'
import {setup, teardown} from './setup'
import {sleep} from './utils'

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

describe('register', () => {
    it('displays', async () => {
        const browserPage = await browser.createPage()
        const status = await browserPage.open(`http://localhost:3000/register`)
        expect(status).toBe('success')

        const text = await browserPage.property('content')
        const $ = cheerio.load(text)
        const page = $('#__next')
        const pageHtml = page.html()
        const html = pretty(pageHtml)
        expect(html).toMatchSnapshot()
    })
})
