import Layout from '../components/layout'
import withPage from '../providers/page'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import {compose} from 'recompose'
import Gravatar from 'react-gravatar'
import moment from 'moment'

export default withPage(() => (
    <Layout title="News" page="news">
        <div className="container">
            <h1>News</h1>
            <p>See what happened recently in the community.</p>
            <News/>
        </div>
    </Layout>
))

const digestEvents = (events) => {
    const byDayUser = {}
    for (const event of events) {
        if (!event.user.local || !event.user.local.username) {
            continue
        }
        const day = moment(event.date).format('YYYYMMDD')
        const userId = event.user._id
        if (!byDayUser[day]) {
            byDayUser[day] = {}
        }
        if (!byDayUser[day][userId]) {
            byDayUser[day][userId] = {
                user: event.user,
                date: event.date,
            }
        }
        integrateEvent(byDayUser[day][userId], event)
    }
    const days = Object.keys(byDayUser)
        .sort().reverse()
        .map(d => {
            const day = byDayUser[d]
            return Object.keys(day).map(k => day[k]).sort((a, b) => a.date - b.date)
        })
    return days
}

const EVENTS_WITH_TITLE = {
    read: ['created-read', 'reading-read', 'read-read', 'wrote-about-read', 'spoke-about-read'],
    goal: ['created-goal', 'doing-goal', 'done-goal'],
}

const integrateEvent = (integrated, event) => {
    if (event.type === 'updated-profile') {
        integrated.updatedProfile = true
    } else {
        let found = false
        for (const key of Object.keys(EVENTS_WITH_TITLE)) {
            if (EVENTS_WITH_TITLE[key].indexOf(event.type) > -1) {
                found = true
                if (!event[key]) {
                    return
                }
                if (!integrated[event.type]) {
                    integrated[event.type] = {}
                }
                integrated[event.type][event.title] = event
            }
        }
        if (!found) {
            throw new Error(`Unknown event type: ${event.type}.`)
        }
    }

    if (event.date > integrated.date) {
        integrated.date = event.date
    }
}

const NewsQuery = gql`
    query {
        events {
            user {
                _id
                profile {
                    name
                }
                emailHash
                local {
                    username
                }
            }
            type
            date
            ... on UpdatedRead {
                title
                read {
                    title
                    read
                    articleUrl
                    videoUrl
                }
            }
            ... on UpdatedGoal {
                title
                goal {
                    title
                }
            }
        }
    }
`
const NewsComponent = ({data: {loading, events}}) => {
    if (loading) {
        return <p>Loading...</p>
    }
    const days = digestEvents(events)
    
    return <div>
        {days.map((day, i) => {
            return <div key={i}>
                {day.map((event, j) => {
                    const {emailHash, local: {username}} = event.user
                    const name = event.user.profile && event.user.profile.name
                    return <div key={j} style={{
                        marginBottom: '24px',
                        display: 'flex',
                    }}>
                        <div>
                            <a href={`/u/${username}`}>
                                <Gravatar md5={emailHash || username} size={75} style={{
                                    marginRight: '24px',
                                }}/>
                            </a>
                        </div>
                        <div>
                            <h4 style={{
                                marginTop: 0
                            }}>
                                <a href={`/u/${username}`}>
                                    {name || username}
                                </a>
                            </h4>
                            <ul style={{
                                paddingLeft: 0,
                                listStylePosition: 'inside',
                            }}>
                                {event.updatedProfile && <li>Updated profile.</li>}
                                {event['done-goal'] && <li>
                                    Achieved
                                    {Object.keys(event['done-goal']).map((t, i) => <span key={i}>
                                        {i ? ',' : ''}&nbsp;<em>{t}</em>
                                        </span>)}
                                </li>}
                                {event['spoke-about-read'] && <li>
                                    Spoke about 
                                    {Object.keys(event['spoke-about-read']).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<a href={event['spoke-about-read'][t].read.videoUrl}>{t}</a>
                                    </span>)}
                                </li>}
                                {event['wrote-about-read'] && <li>
                                    Wrote about 
                                    {Object.keys(event['wrote-about-read']).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<a href={event['wrote-about-read'][t].read.articleUrl}>{t}</a>
                                    </span>)}
                                </li>}
                                {event['read-read'] && <li>
                                    Read
                                    {Object.keys(event['read-read']).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<em>{t}</em>
                                    </span>)}
                                </li>}
                                {event['doing-goal'] && <li>
                                    Is working on
                                    {Object.keys(event['doing-goal']).map((t, i) => <span key={i}>
                                        {i ? ',' : ''}&nbsp;<em>{t}</em>
                                    </span>)}
                                </li>}
                                {event['reading-read'] && <li>
                                    Started reading 
                                    {Object.keys(event['reading-read']).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<em>{t}</em>
                                    </span>)}
                                </li>}
                                {event['created-goal'] && <li>
                                    Wants to achieve
                                    {Object.keys(event['created-goal']).map((t, i) => <span key={i}>
                                        {i ? ',' : ''}&nbsp;<em>{t}</em>
                                    </span>)}
                                </li>}
                                {event['created-read'] && <li>
                                    Added books to reading list: 
                                    {Object.keys(event['created-read']).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<em>{t}</em>
                                    </span>)}
                                </li>}
                            </ul>
                        </div>
                    </div>
                })}
            </div>
        })}
    </div>
}
const News = compose(
    graphql(NewsQuery)
)(NewsComponent)