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
    <Layout title="Profile" page="profile">
        <Profile/>
    </Layout>
))

class ProfileComponent extends Component {
    render() {
        return <div style={{
            maxWidth: '400px',
            margin: 'auto'
        }}>
            <h1>Profile</h1>
            <ProfileForm/>
        </div>
    }
}
const Profile = compose(
    withLoginRequired('/profile'),
)(ProfileComponent)

const profileFields = [
    {
        name: 'name',
        label: 'Name',
    },
    {
        name: 'about',
        label: 'About you',
        type: 'text'
    },
    {
        name: 'bio',
        label: 'Bio',
        type: 'text',
    },
    {
        name: 'goals',
        label: 'Goals',
        type: 'text',
    },
    {
        name: 'website',
        label: 'Website',
        type: 'url',
    },
    {
        name: 'blog',
        label: 'Blog',
        type: 'url',
    },
    {
        name: 'youtube',
        label: 'Youtube',
        type: 'url',
    },
    {
        name: 'twitter',
        label: 'Twitter',
        type: 'url',
    },
    {
        name: 'reddit',
        label: 'Reddit',
        type: 'url',
    },
    {
        name: 'patreon',
        label: 'Patreon',
        type: 'url',
    }
]

const ProfileQuery = gql`
    query {
        me {
            active
            local {
                username
            }
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
        }
    }
`
const UpdateProfileQuery = gql`
    mutation($profile: ProfileInput) {
        updateProfile(profile: $profile) {
            _id
        }
    }
`
class ProfileFormComponent extends Component {
    constructor() {
        super()
        this.state = {}
    }
    render() {
        const {profile: {loading, me, refetch}, updateProfile} = this.props
        const active = me && me.active
        const username = me && me.local && me.local.username
        const profile = (me && me.profile) || {}
        return <div>
            {loading ?
                <span>Loading...</span>
            :
                <div>
                    {username && active &&
                        <p>Your profile is active! It can be found at <a href={`/u/${username}`}>/u/{username}</a>.</p>
                    }
                    {!username &&
                        <div>
                            <h2>Username</h2>
                            <p>To activate your profile set a username in your <a href="/account">account page</a>.</p>
                        </div>
                    }
                    {!active &&
                        <Activate onActivate={refetch}/>
                    }
                    <h2>Edit Profile</h2>
                    <Form
                        onSubmit={() => {
                            const profile = {}
                            profileFields.forEach(({name, type}) => {
                                let value = this[name].value
                                switch (type) {
                                    case 'url':
                                        if (value && !/^https?:\/\/.+/.test(value)) {
                                            value = 'http://' + value
                                        }
                                }
                                profile[name] = value
                            })
                            updateProfile({
                                variables: {
                                    profile
                                }
                            })
                            .then(() => {
                                this.setState({
                                    state: 'success',
                                    message: 'Profile updated!'
                                })
                            })
                            .catch(e => {
                                this.setState({
                                    state: 'error',
                                    message: e.message
                                })
                            })
                        }}
                        state={this.state.state}
                        message={this.state.message}
                        submitLabel="Save profile"
                    >
                        {profileFields.map(({name, label, type}) => (
                            <div key={name} className="form-group">
                                <label htmlFor={name}>{label}</label>
                                {(() => {
                                    switch (type) {
                                        case 'text':
                                            return <textarea
                                                className="form-control"
                                                rows="4"
                                                ref={ref => {
                                                    this[name] = ref
                                                }}
                                                defaultValue={profile[name]}
                                            />
                                        default:
                                            return <input
                                                type="text"
                                                className="form-control"
                                                id={name}
                                                ref={ref => {
                                                    this[name] = ref
                                                }}
                                                defaultValue={profile[name]}
                                            />
                                    }
                                })()}
                            </div>
                        ))}
                    </Form>
                </div>
            }
        </div>
    }
}
const ProfileForm = compose(
    graphql(ProfileQuery, {
        name: 'profile'
    }),
    graphql(UpdateProfileQuery, {
        name: 'updateProfile'
    })
)(ProfileFormComponent)

const ActivateProfileQuery = gql`
    mutation($code: String!) {
        activateProfile(code: $code)
    }
`
class ActivateComponent extends Component {
    constructor() {
        super()
        this.state = {}
    }
    render() {
        const {mutate, onActivate} = this.props
        return <div>
            <h2>Activate</h2>
            <p>To activate your profile enter the Patron code.</p>
            <p>Not a patron yet? For now only patrons can create a profile. You can become a patron and get your code <a href="https://www.patreon.com/nickredmark">on Patreon</a>.</p>
            <Form
                state={this.state.state}
                message={this.state.message}
                onSubmit={() => {
                    const code = this.code.value
                    mutate({
                        variables: {
                            code
                        }
                    })
                        .then(onActivate)
                        .catch(e => {
                            this.setState({
                                state: 'error',
                                message: e.message
                            })
                        })
                }}
                submitLabel="Activate"
            >
                <div className="form-group">
                    <label htmlFor="code">Patron Code</label>
                    <input
                        type="text"
                        className="form-control"
                        id="code"
                        ref={ref => {
                            this.code = ref
                        }}
                    />
                </div>
            </Form>
        </div>
        
    }
}
const Activate = compose(
    graphql(ActivateProfileQuery)
)(ActivateComponent)