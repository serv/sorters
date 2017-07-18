import Layout from '../components/layout'
import withPage from '../providers/page'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import {compose} from 'recompose'

export default withPage(() => (
    <Layout title="Sorters" page="users">
        <div className="container">
            <h1>Sorters</h1>
            <p>Here is a list of all the sorters with a public profile.</p>
            <Users/>
        </div>
    </Layout>
))

const UsersQuery = gql`
    query {
        users {
            local {
                username
            }
        }
    }
`
const UsersComponent = ({data: {loading, users}}) => (
    loading ?
        <p>Loading...</p>
    :
        <ul>
            {users.map(user => (
                <li key={user.local.username}>
                    <a href={`/u/${user.local.username}`}>
                        {user.local.username}
                    </a>
                </li>
            ))}
        </ul>
)
const Users = compose(
    graphql(UsersQuery)
)(UsersComponent)