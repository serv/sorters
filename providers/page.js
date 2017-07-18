import withOothNext from './ooth'
import withNext from './next'
import withApolloNext from './apollo'
import {compose} from 'recompose'

export default compose(
    withApolloNext,
    withOothNext,
    withNext
)
