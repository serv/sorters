import Layout from '../components/layout'
import withPage from '../providers/page'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import {compose} from 'recompose'
import Gravatar from 'react-gravatar'
import Markdown from '../components/markdown'
import {teaserAndInfo} from '../utils/text'

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
            emailHash
            profile {
                name
                about
            }
        }
    }
`
const UsersComponent = ({data: {loading, users}}) => (
    loading ?
        <p>Loading...</p>
    :
        <div className="row">
            {users.map(({local: {username}, emailHash, profile}, key) => {
                const {name, about} = profile || {}
                const {teaser, cut} = teaserAndInfo(about, 140, 150, 160)
                const even = key % 2 === 0
                
                return <div key={username} className="col-xs-12 col-md-6" style={{
                    display: 'flex',
                    marginBottom: '24px',
                    clear: even && 'both'
                }}>
                    <div>
                        <a href={`/u/${username}`}>
                            <Gravatar md5={emailHash || username} size={100} style={{
                                marginRight: '24px',
                            }}/>
                        </a> 
                    </div>
                    <div>
                        <h3 style={{
                            marginTop: 0
                        }}>
                            <a href={`/u/${username}`}>
                                {name || username}
                            </a>
                        </h3>
                        <a href={`/u/${username}`}>
                            /u/{username}
                        </a>
                        <div>
                            <Markdown content={`${teaser}${cut ? ` [more](/u/${username})` : ''}`}/>
                        </div>
                    </div>
                </div>
            })}
        </div>
)
const Users = compose(
    graphql(UsersQuery)
)(UsersComponent)