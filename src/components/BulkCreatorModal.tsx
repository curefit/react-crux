import { omit, isEmpty } from "lodash"
import * as React from "react"
import { Alert, ControlLabel, FormControl, FormGroup, Modal } from "react-bootstrap"
import * as upload from "superagent"
import { InlineComponentProps } from "../CruxComponent"
import * as csv from "csvtojson";
let Dropzone = require("react-dropzone")
if ("default" in Dropzone) {
    Dropzone = Dropzone.default
}

interface BulkCreateModalProps {
    constants?: any,
    showModal: any
    createOrModify: any
    createBulkUserWithJSONdata: any
    createOrEditSuccess: any
    closeModal: any
    additionalProps?: any
}

interface BulkCreateModalState {
    syncUrl: string
    error: any
    inProgress: any
    files: any
    jsonData: any
}

export class BulkCreateModal extends React.Component<BulkCreateModalProps, BulkCreateModalState> {
    constructor(props: any) {
        super(props)
        this.state = {
            syncUrl: "",
            error: null,
            inProgress: false,
            files: [],
            jsonData: []
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

    bulkCreateWithJson = () => {
        this.props.createBulkUserWithJSONdata(this.props.constants.modelName, this.state.jsonData, this.createOrEditSuccess, this.createOrEditError)
    }

    syncUrl = (e: any) => {
        this.setState({ syncUrl: e.target.value })
    }
    onDrop = (acceptedFiles: any) => {
        this.setState({
            files: acceptedFiles
        });
        this.setState({
            inProgress: true
        })

        acceptedFiles.forEach((file: any) => {
            const reader = new FileReader()

            reader.onload = () => {
                const fileAsBinaryString: any = reader.result;

                csv({
                    noheader: true,
                    output: "json"
                })
                    .fromString(fileAsBinaryString)
                    .then((csvRows: any) => {
                        const jsonData: any = [];
                        csvRows.forEach((aCsvRow: any, i: number) => {
                            if (i !== 0) {
                                const builtObject: any = {}

                                Object.keys(aCsvRow).forEach(aKey => {
                                    const valueToAddInBuiltObject = aCsvRow[aKey]
                                    const keyToAddInBuiltObject = csvRows[0][aKey]
                                    builtObject[keyToAddInBuiltObject] = valueToAddInBuiltObject
                                })

                                jsonData.push(builtObject)
                            }
                        });
                        this.setState({
                            inProgress: false,
                            jsonData
                        })
                    });
            };

            reader.onabort = () => console.log("file reading was aborted")
            reader.onerror = () => console.log("file reading has failed")

            reader.readAsText(file, 'ISO-8859-1')
        })
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
        return <Modal
            show={this.props.showModal}
            onHide={this.closeModal}
            container={this}
            aria-labelledby="contained-modal-title"
            dialogClassName={this.props.constants.largeEdit ? "large-modal" : ""}>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title">{"+ Bulk Create " + this.props.constants.creationTitle}</Modal.Title>
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

                <Dropzone style={{ width: "140px", textAlign: "center", color: "#E2356F" }}
                    onDrop={(data: any) => {
                        this.onDrop(data)
                    }} multiple={true}>
                    <div style={{ textAlign: "left", color: "#E2356F" }}>Upload CSV</div>
                    {this.state.inProgress &&
                        <img src="./images/loadingGif.gif" style={{ width: "112px", textAlign: "center" }} />}
                </Dropzone>
                <FormGroup>
                    <ControlLabel>Sync URL</ControlLabel>
                    <FormControl type="text"
                        value={this.state.syncUrl}
                        placeholder="Sync CSV URL" onChange={this.syncUrl} />
                </FormGroup>
            </Modal.Body>
            <Modal.Footer>
                <div className="btn btn-primary" onClick={this.bulkCreate}>Sync With Url</div>
                <div className="btn btn-primary" onClick={this.bulkCreateWithJson}>Sync With File</div>
                <div className="btn btn-secondary" onClick={this.closeModal}>Cancel</div>
            </Modal.Footer>
        </Modal>
    }
}

export default BulkCreateModal
