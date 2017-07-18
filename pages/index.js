import Layout from '../components/layout'
import withPage from '../providers/page'

export default withPage((props) => {
  return <Layout title="Sort yourself out!" page="home">
        <div className="container">
          <div className="jumbotron">
              <h1>Sort yourself out!</h1>
              <p>Join the community of people who like Prof. Jordan Peterson's advice and want to sort themselves out!</p>
              <p><a className="btn btn-primary btn-lg" href="/about" role="button">Learn more &raquo;</a></p>
          </div>
          <div className="row">
            <div className="col-md-4">
              <h2>Follow other sorters</h2>
              <p>Peterson started a movement of people who want to change the world by starting from themselves. See what's happening in the sorter community.</p>
              <p><a className="btn btn-default" href="/users" role="button">See community &raquo;</a></p>
            </div>
            <div className="col-md-4">
              <h2>Share your goals</h2>
              <p>Orient yourself towards the best possible good. Whether you have done the self-authoring suite (recommended) or not, here you can share your vision with the community.</p>
              <p><a className="btn btn-default" href="/register" role="button">Register &raquo;</a></p>
            </div>
            <div className="col-md-4">
              <h2>Begin the sorter journey</h2>
              <p>Share your progress as you clean your room and learn to read, write and speak, all the while rescuing your father from the underworld.</p>
              <p><a className="btn btn-default" href="/register" role="button">Register &raquo;</a></p>
            </div>
          </div>
        </div>
    </Layout>  
})