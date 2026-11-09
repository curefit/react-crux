import { omit, isEmpty } from "lodash"
import * as React from "react"
import { Alert, Form, Modal } from "react-bootstrap"

interface BulkCreateModalProps {
    createOrModify: any
    constants: any
    createOrEditSuccess: any
    closeModal: any
    showModal: any
    additionalProps?: any
}

interface BulkCreateModalState {
    syncUrl: string
    error: any
}

export class BulkCreateModal extends React.Component<BulkCreateModalProps, BulkCreateModalState> {
    constructor(props: any) {
        super(props)
        this.state = {
            syncUrl: "",
            error: null
        }
    }

    createOrEditSuccess = (data: any) => {
        this.props.createOrEditSuccess()
    }

    createOrEditError = (err: any) => {
        this.setState(Object.assign({}, this.state, { error: err }))
        this.closeDeleteModal()
    }

    closeDeleteModal = () => {
        this.setState(Object.assign({}, this.state, { deleteModal: false }))
    }

    closeModal = () => {
        this.setState(Object.assign({}, this.state, omit(this.state, "error")))
        this.props.closeModal()
    }

    bulkCreate = () => {
        this.props.createOrModify(this.props.constants.modelName, this.state.syncUrl, this.createOrEditSuccess, this.createOrEditError)
    }

    syncUrl = (e: any) => {
        this.setState({syncUrl: e.target.value })
    }

    render () {
        let errorType, errorMessage
        if (this.state.error && !isEmpty(this.state.error.message)) {
            try {
                const error: any = JSON.parse(this.state.error.message)
                errorType = error.type
                errorMessage = error.message || error.error.message
            } catch (error) {
                errorMessage = this.state.error.message
            }
        }
        return <Modal
            show={this.props.showModal}
            onHide={this.closeModal}
            aria-labelledby="contained-modal-title"
            dialogClassName={this.props.constants.largeEdit ? "large-modal" : ""}>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title">{"+ Bulk Create " + this.props.constants.creationTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {this.state.error &&
                    <Alert variant="danger">
                        {
                            <div>
                                {errorType && <b>{errorType}</b>}
                                {errorMessage && <div>{errorMessage}</div>}
                            </div>
                        }
                    </Alert>
                }

                    <Form.Group>
                        <Form.Label>Sync URL</Form.Label>
                        <Form.Control type="text"
                                     value={this.state.syncUrl}
                                     placeholder="Sync CSV URL" onChange={this.syncUrl} />
                    </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <div className="btn btn-primary" onClick={this.bulkCreate}>Sync</div>
                <div className="btn btn-secondary" onClick={this.closeModal}>Cancel</div>
            </Modal.Footer>
        </Modal>
    }
}

export default BulkCreateModal
