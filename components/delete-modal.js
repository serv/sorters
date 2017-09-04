import {Component} from 'react'
import ShyButton from './shy-button'
import Modal from 'react-bootstrap/lib/Modal'
import Button from 'react-bootstrap/lib/Button'

class DeleteModal extends Component {
    constructor() {
        super()
        this.state = {}
    }
    render() {
        const {title, message, onDelete} = this.props
        return <span>
            <ShyButton onClick={() => this.setState({
                open: true
            })}>
                🗑
            </ShyButton>
            <Modal show={this.state.open} onHide={() => this.setState({
                open: false
            })}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{message}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => this.setState({
                            open: false
                        })}
                    >Cancel</Button>
                    <Button
                        bsStyle="danger"
                        onClick={() => {
                            onDelete()
                            this.setState({
                                open: false
                            })
                        }}
                    >Delete</Button>
                </Modal.Footer>
            </Modal>
        </span>
    }
}
export default DeleteModal