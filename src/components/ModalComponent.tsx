import autobind from "autobind-decorator"
import * as React from "react"
import * as _ from "lodash"
import { Alert, ControlLabel, FormControl, FormGroup, Modal } from "react-bootstrap"
import { ModalType } from "../CruxComponent"
import { NestedEditComponent } from "./NestedEditComponent"

interface ModalComponentProps {
    constants: any,
    showModal: boolean,
    closeModal: any,
    modalType: ModalType,
    fetch?: any,
    item?: any,
    createOrModify?: any,
    createOrEditSuccess?: any,
    deleteModel?: any,
    filterSuccess?: any,
    filter?: any,
    additionalModels: any[],
    successButtonLabel?: string,
    queryParams: any
}

@autobind
export class ModalComponent extends React.Component<ModalComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            item: this.props.modalType === "CREATE" ? {} : this.props.item,
            deleteModal: false,
            syncUrl: ""
        }
    }

    getRepField = () => {
        const repField = this.props.constants.fields.find((field: any) => field.representative)
        if (!repField) {
            console.error("Did you forget to add the representative tag at the top level.")
        }
        return repField
    }

    modalPerformOperation(modalType: ModalType, edit: boolean) {
        return () => {
            if (modalType === "FILTER") {
                const newItem = Object.assign({}, this.state.item,
                    { skip: 0, paginate: Object.assign({}, this.state.item.paginate, { currentPage: 1 }) })

                // Copies the filter items to persist the preference
                Object.assign(this.props.item, newItem)
                this.props.filter(this.props.constants.modelName, newItem, this.filterSuccess, this.filterError)
            } else if (modalType === "CREATE" || modalType === "EDIT" || modalType === "CUSTOM") {
                this.props.createOrModify(this.props.constants.modelName, this.state.item, edit, this.createOrEditSuccess, this.createOrEditError, this.props.queryParams)
            }
        }
    }

    bulkCreate = () => {
        this.props.createOrModify(this.props.constants.modelName, this.state.syncUrl, this.createOrEditSuccess, this.createOrEditError)
    }

    createOrEditSuccess = (data: any) => {
        this.props.createOrEditSuccess()
    }

    filterSuccess(data: any) {
        this.props.filterSuccess()
    }

    filterError(err: any) {
        this.setState(Object.assign({}, this.state, { error: err }))
    }

    createOrEditError = (err: any) => {
        this.setState(Object.assign({}, this.state, { error: err }))
        this.closeDeleteModal()
    }

    closeModal = () => {
        this.setState(Object.assign({}, this.state, _.omit(this.state, "error")))
        this.props.closeModal()
    }

    syncUrl = (e: any) => {
            this.setState({syncUrl: e.target.value })
    }

    modelChanged = (value: any) => {
        const newModel = { item: Object.assign({}, this.state.item, value) }
        this.setState(Object.assign({}, this.state, newModel))
    }

    openDeleteModal = () => {
        this.setState(Object.assign({}, this.state, { deleteModal: true }))
    }

    closeDeleteModal = () => {
        this.setState(Object.assign({}, this.state, { deleteModal: false }))
    }

    deleteModel = () => {
        this.props.deleteModel(this.props.constants.modelName, this.state.item, this.createOrEditSuccess, this.createOrEditError, this.props.queryParams)
    }

    render() {
        let errorType, errorMessage
        if (this.state.error && !_.isEmpty(this.state.error.message)) {
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
            container={this}
            aria-labelledby="contained-modal-title"
            dialogClassName={this.props.constants.largeEdit ? "large-modal" : ""}>
            <Modal.Header closeButton>
                {this.props.modalType === "CREATE" &&
                    <Modal.Title id="contained-modal-title">{"+ New " + this.props.constants.creationTitle}</Modal.Title>}
                {this.props.modalType === "EDIT" && <Modal.Title
                    id="contained-modal-title">{"Edit " + this.props.constants.creationTitle + " - " + this.props.item[this.getRepField().field]}</Modal.Title>}
                {this.props.modalType === "FILTER" &&
                    <Modal.Title id="contained-modal-title">{"Filter " + this.props.constants.creationTitle}</Modal.Title>}
                {this.props.modalType === "CUSTOM" &&
                    <Modal.Title id="contained-modal-title">{"Custom " + this.props.constants.creationTitle + " - " + this.props.item[this.getRepField().field]}</Modal.Title>}
                {this.props.modalType === "BULK_CREATE" &&
                    <Modal.Title id="contained-modal-title">{"+ Bulk Create " + this.props.constants.creationTitle}</Modal.Title>}
            </Modal.Header>
            <Modal.Body>
                {this.state.error &&
                    <Alert bsStyle="danger">
                        {
                            <div>
                                {errorType && <b>{errorType}</b>}
                                {errorMessage && <div>{errorMessage}</div>}
                            </div>
                        }
                    </Alert>
                }

                {this.props.modalType === "BULK_CREATE" ?
                        <FormGroup>
                            <ControlLabel>Sync URL</ControlLabel>
                            <FormControl type="text"
                                         value={this.state.syncUrl}
                                         placeholder="Sync CSV URL" onChange={this.syncUrl} />
                        </FormGroup>
                    : <NestedEditComponent
                        field={this.props.constants} modalType={this.props.modalType}
                        readonly={this.props.constants.readonly === true}
                        additionalModels={this.props.additionalModels} fetch={this.props.fetch}
                        modelChanged={this.modelChanged} currentModel={this.state.item}
                        showTitle={false}
                        parentModel={{}}
                />}

            </Modal.Body>
            <Modal.Footer>
                {this.props.modalType === "EDIT" &&
                    <div className="btn btn-danger" style={{ float: "left" }} onClick={this.openDeleteModal}>
                        Delete</div>}
                {this.state.deleteModal &&
                    <Modal show={this.state.deleteModal} onHide={this.closeDeleteModal} container={this}>
                        <Modal.Header closeButton>
                            {"Delete " + this.props.constants.creationTitle}
                        </Modal.Header>
                        <Modal.Body>
                            {"Are you sure you want to delete " + this.props.item[this.getRepField().field] + " ?"}
                        </Modal.Body>
                        <Modal.Footer>
                            <div className="btn btn-danger" onClick={this.deleteModel}>Delete</div>
                            <div className="btn btn-secondary" onClick={this.closeDeleteModal}>Cancel</div>
                        </Modal.Footer>
                    </Modal>
                }
                {this.props.modalType === "EDIT" ?
                    <>
                        <div className="btn btn-primary" onClick={this.modalPerformOperation(this.props.modalType, true)}>Update</div>
                        {this.props.constants.saveAsNew &&
                            <div className="btn btn-primary" onClick={this.modalPerformOperation(this.props.modalType, false)}>Save as New</div>}
                    </> : null}
                {this.props.modalType === "CREATE" || this.props.modalType === "CUSTOM" ? (
                    <div className="btn btn-primary" onClick={this.modalPerformOperation(this.props.modalType, false)}>{this.props.successButtonLabel || "Create"}</div>
                ) : null}
                {this.props.modalType === "FILTER" ? (
                    <div className="btn btn-primary" onClick={this.modalPerformOperation(this.props.modalType, false)}>Filter</div>
                ) : null}

                {this.props.modalType === "BULK_CREATE" ? (
                    <div className="btn btn-primary" onClick={this.bulkCreate}>Sync</div>
                ) : null}
                <div className="btn btn-secondary" onClick={this.closeModal}>Cancel</div>
            </Modal.Footer>
        </Modal>
    }
}
