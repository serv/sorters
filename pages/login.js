import Layout from '../components/layout'
import withPage from '../providers/page'
import {LoginForm} from 'staart/lib/components/login'

export default withPage(({url: {query: {next}}}) => {
    return <Layout title="Log in" page="login">
        <div style={{
            maxWidth: '300px',
            margin: 'auto'
        }}>
            <h1>Log in</h1>
            <LoginForm next={next}/>
            <p>New user? <a href="/register">register</a>.</p>
        </div>
    </Layout>
})