import {Component} from 'react'
import Layout from '../components/layout'
import withPage from '../providers/page'
import {compose} from 'recompose'
import {withUser} from 'ooth-client-react'
import withLoginRequired from 'staart/lib/hocs/login-required'

export default withPage(() => (
    <Layout title="Dashboard" page="dashboard">
        <Dashboard/>
    </Layout>
))

const DashboardComponent = ({user}) => (
    <div className="container">
        <h1>Dashboard</h1>
        <p>Thank you for joining sorters club! This is your dashboard.</p>
        <p>As the platform develops, you will find more features here.</p>
        <p>If there is a feature you wish you can discuss this with us on <a href="https://www.patreon.com/nickredmark" target="_blank">Patreon</a>.</p>
          <div className="row">
            <div className="col-md-4">
              <h2>Profile</h2>
              <p>Edit your public profile that can be seen by others.</p>
              {user.local && user.local.username &&
                <p>
                    Your profile can be found at <a href={`/u/${user.local.username}`}>{`/u/${user.local.username}`}</a>.
                </p>
              }
              <p><a className="btn btn-default" href="/profile" role="button">Manage profile</a></p>
            </div>
            <div className="col-md-4">
              <h2>Goals</h2>
              <p>Share your goals and leave updates.</p>
              <p><a className="btn btn-default" href="/goals" role="button">Manage goals</a></p>
            </div>
            <div className="col-md-4">
              <h2>Reading list</h2>
              <p>Create a list of things you read and intend to read, with links to your articles and videos.</p>
              <p><a className="btn btn-default" href="/reads" role="button">Manage reading list</a></p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <h2>Sorters</h2>
              <p>See what other sorters are doing.</p>
              <p><a className="btn btn-default" href="/users" role="button">Sorters</a></p>
            </div>
            <div className="col-md-4">
              <h2>Chat</h2>
              <p>Chat with other sorters (a Discord channel).</p>
              <p><a className="btn btn-default" href="https://discord.gg/6Q8v9Sm" role="button" target="_blank">Chat</a></p>
            </div>
            <div className="col-md-4">
              <h2>Account</h2>
              <p>Set your username, password etc.</p>
              <p><a className="btn btn-default" href="/account" role="button">Manage account</a></p>
            </div>
          </div>
    </div>
)
const Dashboard = compose(
    withLoginRequired('/dashboard'),
    withUser
)(DashboardComponent)