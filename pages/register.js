import Layout from '../components/layout'
import withPage from '../providers/page'
import {RegisterForm} from 'staart/lib/components/register'

export default withPage(({url: {query: {next}}}) => {
    return <Layout title="Register" page="register">
        <div style={{
            maxWidth: '300px',
            margin: 'auto'
        }}>
            <h1>Register</h1>
            <RegisterForm next={next} strategies={['local']}/>
            <p>Already have an account? <a href="/login">Log in</a>.</p>
        </div>
    </Layout>
})
