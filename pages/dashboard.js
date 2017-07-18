import {Component} from 'react'
import Layout from '../components/layout'
import withPage from '../providers/page'
import {withUser} from 'ooth-client-react'
import {compose} from 'recompose'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import withLoginRequired from 'staart/lib/hocs/login-required'
import Form from 'staart/lib/components/form'

export default withPage(() => (
    <Layout title="Dashboard" page="dashboard">
        <Dashboard/>
    </Layout>
))

const DashboardComponent = () => (
    <div className="container">
        <h1>Dashboard</h1>
        <p>Thank you for joining sorters club! This is your dashboard.</p>
        <p>As the platform develops, you will find more features here.</p>
        <p>If there is a feature you wish you can discuss this with us on <a href="https://www.patreon.com/nickredmark" target="_blank">Patreon</a>.</p>
        <ul>
            <li><a href="/account">Manage your account</a></li>
            <li><a href="/profile">Manage your profile</a></li>
            <li><a href="/users">Find other sorters</a></li>
        </ul>
    </div>
)
const Dashboard = compose(
    withLoginRequired('/dashboard')
)(DashboardComponent)