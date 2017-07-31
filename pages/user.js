import Layout from '../components/layout'
import withPage from '../providers/page'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import {compose} from 'recompose'
import Markdown from '../components/markdown'
import Gravatar from 'react-gravatar'

export default withPage(({url: {query: {username}}}) => (
    <Layout title="Sorter" page="user">
        <div className="container">
            <User username={username}/>
        </div>
    </Layout>
))

const urlFields = [
    {
        name: 'website',
        label: 'Website'
    },
    {
        name: 'blog',
        label: 'Blog'
    },
    {
        name: 'youtube',
        label: 'Youtube'
    },
    {
        name: 'twitter',
        label: 'Twitter'
    },
    {
        name: 'reddit',
        label: 'Reddit'
    },
    {
        name: 'patreon',
        label: 'Patreon'
    }
]

const UserQuery = gql`
    query($username: String!) {
        userByUsername(username: $username) {
            local {
                username
            }
            emailHash
            profile {
                name
                about
                bio
                goals
                website
                blog
                youtube
                twitter
                reddit
                patreon
            }
            reads {
                title
                read
                articleUrl
                videoUrl
            }
        }
    }
`
const UserComponent = (props) => {
    const {data: {loading, userByUsername: user, error}} = props
    if (loading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    if (!user) {
        return <p>Invalid user.</p>
    }

    const username = user.local.username
    const emailHash = user.emailHash
    const profile = user.profile || {}
    const reads = user.reads || []

    const urls = []
    urlFields.map(({name, label}) => {
        if (profile[name]) {
            urls.push({
                name,
                label,
                url: profile[name]
            })
        }
    })

    return <div>
        <h1>
            {profile.name || username}
        </h1>
        <div style={{
            display: 'flex'
        }}>
            {emailHash &&
                <Gravatar md5={emailHash || username} size={200} style={{
                    marginRight: '24px',
                    marginBottom: '24px'
                }}/>
            }
            <div>
                <p><a href={`/u/${username}`}>/u/{username}</a></p>
                {profile.about && 
                    <div>
                        <Markdown content={profile.about}/>
                    </div>
                }
            </div>
            <div style={{clear: 'both'}}/>
        </div>
        {urls.length > 0 && <div>
            <h2>Links</h2>
            <ul>
                {urls.map(({name, label, url}) => (
                    <li key={name}>
                        <label style={{
                            width: '100px',
                            marginRight: '24px'
                        }}>{label}</label>
                        <a href={profile[name]}>{profile[name]}</a>
                    </li>
                ))}
            </ul>
        </div>}
        {profile.bio && 
            <div>
                <h2>Bio</h2>
                <Markdown content={profile.bio}/>
            </div>
        }
        {profile.goals &&
            <div>
                <h2>Goals</h2>
                <Markdown content={profile.goals}/>
            </div>
        }
        {reads.length > 0 &&
            <div>
                <h2>Reading List</h2>
                <ul>
                    {reads.map(({title, read, articleUrl, videoUrl}, key) => (
                        <li key={key}>
                            <span>{title}</span>
                            {read && <span>&nbsp;✔</span>}
                            {(articleUrl || videoUrl) && <span>(
                                {articleUrl && <a href={articleUrl}>article</a>}
                                {articleUrl && videoUrl && <span>,&nbsp;</span>}
                                {videoUrl && <a href={videoUrl}>video</a>}
                            )</span>}
                        </li>                   
                    ))}
                </ul>
            </div>
        }
    </div>
}
const User = compose(
    graphql(UserQuery, {
        options: ({username}) => ({
            variables: {
                username
            }
        })
    })
)(UserComponent)