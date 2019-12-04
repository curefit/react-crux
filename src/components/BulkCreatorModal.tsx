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

// interface BulkCreateModalProps {
//     createOrModify: any
//     createOrEditSuccess: any
//     closeModal: any
//     showModal: any
//     field: any,
//     modelChanged: any,
//     additionalModels: any
//     currentModel: any
//     fetch?: any
//     indent?: boolean
//     showTitle?: boolean
//     width?: string
//     height?: string
//     contentType?: string
//     item?: any
//     parentModel: any,
//     shouldRender?: boolean,
//     urlPrefix?: string,
//     urlSuffix?: string
//     constants?: any,
//     anchors?: any,
//     readonly?: boolean,
//     isMulti?: boolean,
//     index?: number
//     style?: any
//     iterableNested?: boolean
//     nestedIterableModelChanged?: any
//     additionalProps?: any
// }

// interface BulkCreateModalState {
//     syncUrl: string
//     error: any
//     inProgress: any
//     files: any
// }

export class BulkCreateModal extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            syncUrl: "",
            error: null,
            inProgress: false,
            files: []
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
        this.props.createOrModify(this.props.constants.modelName, this.state.toJson, this.createOrEditSuccess, this.createOrEditError)
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
                        const toJson: any = [];
                        console.log(csvRows, 'csvRows');
                        csvRows.forEach((aCsvRow: any, i: number) => {
                            if (i !== 0) {
                                const builtObject: any = {}

                                Object.keys(aCsvRow).forEach(aKey => {
                                    const valueToAddInBuiltObject = aCsvRow[aKey]
                                    const keyToAddInBuiltObject = csvRows[0][aKey]
                                    builtObject[keyToAddInBuiltObject] = valueToAddInBuiltObject
                                })

                                toJson.push(builtObject)
                            }
                        });
                        console.log(toJson, 'toJson');
                        this.setState({
                            inProgress: false,
                            toJson
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
                    disabled={this.props.readonly}
                    onDrop={(data: any) => {
                        this.onDrop(data)
                    }} multiple={true}>
                    <div style={{ textAlign: "left", color: "#E2356F" }}>Upload CSV</div>
                    {this.state.inProgress &&
                        <img src="./images/loadingGif.gif" style={{ width: "112px", textAlign: "center" }} />}
                </Dropzone>
            </Modal.Body>
            <Modal.Footer>
                <div className="btn btn-primary" onClick={this.bulkCreate}>Sync With Url</div>
                <div className="btn btn-primary" onClick={this.bulkCreate}>Sync With File</div>
                <div className="btn btn-secondary" onClick={this.closeModal}>Cancel</div>
            </Modal.Footer>
        </Modal>
    }
}

export default BulkCreateModal
