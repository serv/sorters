import cheerio from 'cheerio'
import pretty from 'pretty'
import {ObjectID} from 'mongodb'
import {setup, teardown} from './setup'
import {sleep, request} from './utils'
import setCookie from 'set-cookie-parser'

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

describe('dashboard', () => {
    it('redirects when unlogged', async () => {
        const browserPage = await browser.createPage()
        const status = await browserPage.open(`http://localhost:3000/dashboard`)
        expect(status).toBe('success')

        const text = await browserPage.property('content')
        const $ = cheerio.load(text)
        const page = $('#__next')
        const pageHtml = page.html()
        const html = pretty(pageHtml)
        expect(html).toMatchSnapshot()
    })

    it('displays when logged', async () => {
        const browserPage = await browser.createPage()
        
        let data = await request(browserPage, `http://localhost:3000/auth/local/register`, 'POST', {
            email: 'example@example.com',
            password: 'Somepass01',
        })
        expect(data).toMatchSnapshot()

        data = await request(browserPage, `http://localhost:3000/auth/local/login`, 'POST', {
            username: 'example@example.com',
            password: 'Somepass01',
        });
        expect(data.user._id)

        const status = await browserPage.open(`http://localhost:3000/dashboard`)
        expect(status).toBe('success')
        const text = await browserPage.property('content')
        const $ = cheerio.load(text)
        const page = $('#__next')
        const pageHtml = page.html()
        const html = pretty(pageHtml)
        expect(html).toMatchSnapshot()
    })
})
