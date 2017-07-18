import Layout from 'staart/lib/components/layout'
import React from 'react'

const menu = [
    {
        url: '/',
        name: 'home',
        label: 'Home'
    },
    {
        url: '/about',
        name: 'about',
        label: 'About'
    },
    {
        url: '/users',
        name: 'users',
        label: 'Sorters'
    }
]

const userMenu = [
    {
        url: '/dashboard',
        name: 'dashboard',
        label: 'Dashboard'
    },
    {
        url: '/profile',
        name: 'profile',
        label: 'Profile'
    },
    {
        url: '/account',
        name: 'account',
        label: 'Account'
    },
    {
        url: '/logout',
        name: 'logout',
        label: 'Log out'
    }
]

const siteName = 'Sorters Club'

export default (props) => (
    <Layout
        menu={menu}
        userMenu={userMenu}
        siteName={siteName}
        footerMessage={<p>Brought to you with ❤ by <a href="/about">Nick Redmark</a>. Support and discuss the development of this platform on <a href="https://www.patreon.com/nickredmark" target="_blank">Patreon</a>.</p>}
        {...props}
    />
)