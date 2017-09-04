import {MongoClient, ObjectID} from 'mongodb'
import {spawn} from 'child_process'
import phantom from 'phantom'

export const setup = async () => {
    const db = await MongoClient.connect('mongodb://localhost:27017/sorters_test')

    let app
    
    await new Promise((resolve, reject) => {
        app = spawn('npm', ['run', 'start:test'], {detached: true})
        app.stdout.on('data', (data) => {
            if (/^Online at/.test(data)) {
                console.log(data.toString())
                resolve()
            }
        })
        app.stderr.on('data', (data) => {
            console.warn(data.toString())
        })
    })

    const browser = await phantom.create([], { logLevel: 'error' })
    
    return {db, app, browser}
}

export const teardown = async ({db, app, browser}) => {
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

    await browser.exit()
}