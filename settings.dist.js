module.exports = {
    url: 'http://localhost',
    port: 3000,
    wsPort: 3005,
    originUrl: 'http://localhost:3000',
    mongoUrl: 'mongodb://localhost:27017/sorters',
    sharedSecret: 'XXX',
    sessionSecret: 'XXX',
    oothPath: '/auth',
    mailgun: {
        apiKey: "XXX",
        domain: "XXX"
    },
    mail: {
        from: "noreply@sorters.com"
    }
}
