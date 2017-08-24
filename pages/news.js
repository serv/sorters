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

const integrateEvent = (integrated, event) => {
    switch (event.type) {
        case 'updated-profile':
            integrated.updatedProfile = true
            break
        case 'created-read':
            if (!event.read) {
                return;
            }
            if (!integrated.createdReads) {
                integrated.createdReads = {}
            }
            integrated.createdReads[event.read.title] = event.read
            break
        case 'reading-read':
            if (!event.read) {
                return;
            }
            if (!integrated.readingReads) {
                integrated.readingReads = {}
            }
            integrated.readingReads[event.read.title] = event.read
            break
        case 'read-read':
            if (!event.read) {
                return;
            }
            if (!integrated.readReads) {
                integrated.readReads = {}
            }
            integrated.readReads[event.read.title] = event.read
            break
        case 'wrote-about-read':
            if (!event.read) {
                return;
            }
            if (!integrated.wroteAboutReads) {
                integrated.wroteAboutReads = {}
            }
            integrated.wroteAboutReads[event.read.title] = event.read
            break
        case 'spoke-about-read':
            if (!event.read) {
                return;
            }
            if (!integrated.spokeAboutReads) {
                integrated.spokeAboutReads = {}
            }
            integrated.spokeAboutReads[event.read.title] = event.read
            break
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
                                {event.spokeAboutReads && <li>
                                    Spoke about 
                                    {Object.keys(event.spokeAboutReads).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<a href={event.spokeAboutReads[t].videoUrl}>{t}</a>
                                    </span>)}
                                </li>}
                                {event.wroteAboutReads && <li>
                                    Wrote about 
                                    {Object.keys(event.wroteAboutReads).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<a href={event.wroteAboutReads[t].articleUrl}>{t}</a>
                                    </span>)}
                                </li>}
                                {event.readReads && <li>
                                    Read
                                    {Object.keys(event.readReads).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<em>{t}</em>
                                    </span>)}
                                </li>}
                                {event.readingReads && <li>
                                    Started reading 
                                    {Object.keys(event.readingReads).map((t, i) => <span key={t}>
                                        {i ? ',' : ''}&nbsp;<em>{t}</em>
                                    </span>)}
                                </li>}
                                {event.createdReads && <li>
                                    Added books to reading list: 
                                    {Object.keys(event.createdReads).map((t, i) => <span key={t}>
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