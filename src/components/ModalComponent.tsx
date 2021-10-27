import autobind from "autobind-decorator"
import * as React from "react"
import { omit, isEmpty, isObject, isArray, isNil } from "lodash"
import { Alert, Modal } from "react-bootstrap"
import { ModalType } from "../CruxComponent"
import { NestedEditComponent } from "./NestedEditComponent"
import * as ReactDOM from "react-dom"

interface ModalComponentProps {
    constants: any,
    showModal: boolean,
    closeModal: any,
    modalIndex?: any,
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
    additionalProps?: any
    setValueInArray?: any
    showModalComponent?: boolean
    showMinimize?: boolean
}

@autobind
export class ModalComponent extends React.Component<ModalComponentProps, any> {

    private modalBodyRef: any

    constructor(props: any) {
        super(props)
        this.state = {
            item: this.props.item || {},
            deleteModal: false,
            showModal: props.showModalComponent === false ? false : true
        }
    }

    getRepField = () => {
        const repField = this.props.constants.fields.find((field: any) => field.representative)
        if (!repField) {
            console.error("Did you forget to add the representative tag at the top level.")
        }
        return repField
    }

    getInitialState() {
        return {
            item: this.props.modalType === "CREATE" ? {} : this.props.item,
            deleteModal: false
        }
    }

    modalPerformOperation(modalType: ModalType, edit: boolean) {
        return () => {
            this.setState({requestInProgress: true})
            if (modalType === "FILTER") {
                const newItem = Object.assign({}, this.state.item,
                    { skip: 0, paginate: Object.assign({}, this.state.item.paginate, { currentPage: 1 }) })

                // Copies the filter items to persist the preference
                Object.assign(this.props.item, newItem)
                this.props.filter(this.props.constants.modelName, newItem, this.filterSuccess, this.filterError, this.props.queryParams)
            } else if (modalType === "CREATE" || modalType === "EDIT" || modalType === "CUSTOM") {
                try {
                    this.validateItem(this.state.item, this.props.constants)
                } catch (e) {
                    this.createOrEditError(e)
                    return
                }
                this.props.createOrModify(this.props.constants.modelName, this.state.item, edit, this.createOrEditSuccess, this.createOrEditError, this.props.queryParams)
            }
        }
    }

    createOrEditSuccess = (data: any) => {
        this.setState({requestInProgress: false})
        this.props.createOrEditSuccess(this.props.modalIndex)
    }

    filterSuccess(data: any) {
        this.setState({requestInProgress: false})
        this.props.filterSuccess()
    }

    filterError(err: any) {
        this.setState({ error: err, requestInProgress: false })
    }

    createOrEditError = (err: any) => {
        this.setState({ error: err, requestInProgress: false })
        this.closeDeleteModal()
        if (this.modalBodyRef) {
            this.modalBodyRef.scrollTop = 0
        }
    }

    closeModal = () => {
        this.setState({error: undefined})
        this.props.closeModal(this.props.modalIndex)
    }

    modelChanged = (value: any) => {
        this.setState((prevState: any) => {
            return { item: Object.assign({}, prevState.item, value) }
        })
    }

    openDeleteModal = () => {
        this.setState({ deleteModal: true })
    }

    closeDeleteModal = () => {
        this.setState({ deleteModal: false })
    }

    deleteModel = () => {
        this.props.deleteModel(this.props.constants.modelName, this.state.item, this.createOrEditSuccess, this.createOrEditError, this.props.queryParams)
    }

    validateItem(data: any, schema: any): boolean {
        for (const field of schema.fields??[]) {
            if (field.required === true) {
                if(!data) {
                    throw new Error(`${schema.title ?? schema.field} is required as "${field.title ?? field.field}" is a required field`)
                }
                else if(field.type === "nested" && (!isObject(data[field.field]) || isEmpty(data[field.field]))) {
                    throw new Error(`${field.title ?? field.field} is a required field`)
                }
                else if(field.type === "iterable" && (!isArray(data[field.field]) || data[field.field].length === 0)) {
                    throw new Error(`${field.title ?? field.field} is a required field`)
                }
                else if(isNil(data[field.field])) {
                    throw new Error(`${field.title ?? field.field} is a required field`)
                }

                if (field.type === "nested" && data) {
                    return this.validateItem(data[field.field], field)
                }
                else if (field.type === "iterable" && data && data[field.field] && data[field.field].length > 0) {
                    for (const x of data[field.field]) {
                        this.validateItem(x, field.iterabletype)
                    }
                }
            }
        }
        return true
    }

    render() {
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
        const { requestInProgress } = this.state
        const errorClassName = this.state.error ? "error-animate" : ""
        return this.props.showModal ? [
            <Modal
                show={this.state.showModal}
                onHide={this.closeModal}
                container={this}
                aria-labelledby="contained-modal-title"
                backdrop={this.props.constants.disableModalOutsideClick ? "static" : true}
                dialogClassName={this.props.constants.largeEdit ? `${errorClassName} large-modal` : `${errorClassName}`}>
                <Modal.Header closeButton>
                    {this.props.modalType === "CREATE" &&
                        <Modal.Title id="contained-modal-title">{"+ New " + this.props.constants.creationTitle}</Modal.Title>}
                    {this.props.modalType === "EDIT" && <Modal.Title
                        id="contained-modal-title">{"Edit " + this.props.constants.creationTitle + " - " + this.props.item[this.getRepField().field]}</Modal.Title>}
                    {this.props.modalType === "FILTER" &&
                        <Modal.Title id="contained-modal-title">{"Filter " + this.props.constants.creationTitle}</Modal.Title>}
                    {this.props.modalType === "CUSTOM" &&
                        <Modal.Title id="contained-modal-title">{"Custom " + this.props.constants.creationTitle + " - " + this.props.item[this.getRepField().field]}</Modal.Title>}

                  {this.props.showMinimize ?  <div className="minimise_icon" onClick={() => {
                        this.props.setValueInArray ? this.props.setValueInArray(this.props.modalIndex, this.state.item) : null
                        this.setState({showModal: false})
                    }}>-</div> : null}
                </Modal.Header>
                <Modal.Body ref={reactComponent => this.modalBodyRef = ReactDOM.findDOMNode(reactComponent)} className="modal-height">
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
                    <NestedEditComponent field={this.props.constants} modalType={this.props.modalType}
                        readonly={this.props.modalType !== "CREATE" && this.props.constants.readonly === true}
                        additionalModels={this.props.additionalModels} fetch={this.props.fetch}
                        modelChanged={this.modelChanged} currentModel={this.state.item}
                        additionalProps={this.props.additionalProps}
                        showTitle={false}
                        parentModel={{}}
                    />
                </Modal.Body>
                <Modal.Footer>
                    {this.props.deleteModel && this.props.modalType === "EDIT" &&
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
                            <button disabled={requestInProgress} className="btn btn-primary" onClick={this.modalPerformOperation(this.props.modalType, true)}>Update</button>
                            {this.props.constants.saveAsNew &&
                                <button disabled={requestInProgress} className="btn btn-primary" onClick={this.modalPerformOperation(this.props.modalType, false)}>Save as New</button>}
                        </> : null}
                    {this.props.modalType === "CREATE" || this.props.modalType === "CUSTOM" ? (
                        <button disabled={requestInProgress} className="btn btn-primary" onClick={this.modalPerformOperation(this.props.modalType, false)}>{this.props.successButtonLabel || "Create"}</button>
                    ) : null}
                    {this.props.modalType === "FILTER" ? (
                        <button disabled={requestInProgress} className="btn btn-primary" onClick={this.modalPerformOperation(this.props.modalType, false)}>Filter</button>
                    ) : null}
                    <button disabled={requestInProgress} className="btn btn-secondary" onClick={this.closeModal}>Cancel</button>
                </Modal.Footer>
            </Modal>,
            !this.state.showModal ? <div onClick={() => {
                this.setState({showModal: true})
            }} className="bottomTabsCss">
                {this.props.constants.creationTitle} - {this.state.item ? this.state.item[this.getRepField().field] : ""}
                <img src="https://cdn2.iconfinder.com/data/icons/lucid-generic/24/expand_maximise_send_transfer_share-512.png" style={{
                    width: 20,
                    marginLeft: 20
                }} />
            </div> : null
        ] : null
    }
}
