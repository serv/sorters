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
                reading
            }
            reads {
                title
                reading
                read
                articleUrl
                videoUrl
            }
            goals {
                title
                description
                doing
                done
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
    const {name, about, bio, goals, reading} = profile
    const goalsList = user.goals || []

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
            {name || username}
        </h1>
        <div className="row">
            <div className="col-xs-6 col-sm-3 col-md-2">
                <Gravatar md5={emailHash || username} size={200} style={{
                    marginBottom: '24px',
                    width: '100%',
                    height: 'auto',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'block'
                }}/>
            </div>
            <div className="col-xs-12 col-sm-9 col-md-10">
                <p><a href={`/u/${username}`}>/u/{username}</a></p>
                {about && 
                    <div>
                        <Markdown content={about}/>
                    </div>
                }
            </div>
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
        {bio && 
            <div>
                <h2>Bio</h2>
                <Markdown content={bio}/>
            </div>
        }
        {(goalsList.length > 0 || goals) && <h2>Goals</h2>}
        {goals &&
            <Markdown content={goals}/>
        }
        {goalsList.length > 0 &&
            <ul>
                {goalsList.map(({title, description, doing, done}, key) => {
                    const goalStatus = done ? 'done' : (doing ? 'doing' : 'not')
                    return <li key={key}>
                        <span>{title}</span>
                        {goalStatus === 'doing' && <span>&nbsp;⛏</span>}
                        {goalStatus === 'done' && <span>&nbsp;✔</span>}
                    </li>
                })}
            </ul>
        }
        {(reads.length > 0 || reading) && <h2>Reading List</h2>}
        {reading && <Markdown content={reading}/>}
        {reads.length > 0 &&
            <ul>
                {reads.map(({title, reading, read, articleUrl, videoUrl}, key) => {
                    const readingStatus = read ? 'read' : (reading ? 'reading' : 'not')
                    return <li key={key}>
                        <span>{title}</span>
                        {readingStatus === 'read' && <span>&nbsp;✔</span>}
                        {readingStatus === 'reading' && <span>&nbsp;👁</span>}
                            {(articleUrl || videoUrl) && <span>&nbsp;(
                            {articleUrl && <a href={articleUrl}>article</a>}
                            {articleUrl && videoUrl && <span>,&nbsp;</span>}
                            {videoUrl && <a href={videoUrl}>video</a>}
                        )</span>}
                    </li>                   
                })}
            </ul>
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