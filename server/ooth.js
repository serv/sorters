const express = require('express')
const Ooth = require('ooth')
const oothLocal = require('ooth-local')
const oothFacebook = require('ooth-facebook')
const oothGoogle = require('ooth-google')
const mail = require('./mail')

module.exports = async function start(app, settings) {

    const ooth = new Ooth({
        mongoUrl: settings.mongoUrl,
        sharedSecret: settings.sharedSecret,
        path: settings.oothPath,
    })

    await ooth.start(app)

    const sendMail = mail(settings.mailgun)
    ooth.use('local', oothLocal({
        onRegister({email, verificationToken}) {
            sendMail({
                from: settings.mail.from,
                to: email,
                subject: 'Welcome to Sorters Club',
                body: `Thank you for joining Sorters Club!`,
                html: `Thank you for joining Sorters Club!`,
            })
            sendMail({
                from: settings.mail.from,
                to: email,
                subject: 'Verify your Sorters Club email address',
                body: `Please verify your Sorters Club email by opening the following url: ${settings.url}/verify-email?token=${verificationToken}.`,
                html: `Please verify your Sorters Club email by opening the following url: ${settings.url}/verify-email?token=${verificationToken}.`,
            })
        },
        onGenerateVerificationToken({email, verificationToken}) {
            sendMail({
                from: settings.mail.from,
                to: email,
                subject: 'Verify your Sorters Club email address',
                body: `Please verify your Sorters Club email by opening the following url: ${settings.url}/verify-email?token=${verificationToken}.`,
                html: `Please verify your Sorters Club email by opening the following url: ${settings.url}/verify-email?token=${verificationToken}.`,
            })
        },
        onVerify({email}) {
            sendMail({
                from: settings.mail.from,
                to: email,
                subject: 'Sorters Club Address verified',
                body: `Your Sorters Club email address has been verified.`,
                html: `Your Sorters Club email address has been verified.`,
            })
        },
        onForgotPassword({email, passwordResetToken}) {
            sendMail({
                from: settings.mail.from,
                to: email,
                subject: 'Reset Sorters Club password',
                body: `Reset your password for Sorters Club on the following page: ${settings.url}/reset-password?token=${passwordResetToken}.`,
                html: `Reset your password for Sorters Club on the following page: ${settings.url}/reset-password?token=${passwordResetToken}.`,
            })
        },
        onResetPassword({email}) {
            sendMail({
                from: settings.mail.from,
                to: email,
                subject: 'Sorters Club Password Reset',
                body: 'Your password for Sorters Club has been reset.',
                html: 'Your password for Sorters Club has been reset.'
            })
        },
        onChangePassword({email}) {
            sendMail({
                from: settings.mail.from,
                to: email,
                subject: 'Sorters Club Password Changed',
                body: 'Your password for Sorters Club has been changed.',
                html: 'Your password for Sorters Club has been changed.'
            })
        }
    }))

    ooth.use('facebook', oothFacebook(settings.facebook))

    ooth.use('google', oothGoogle(settings.google))

}
