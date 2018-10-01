import * as React from "react"
import { connect } from "react-redux"
import { fetchModel, createOrModify, deleteModel, filterModel } from "./Actions"
import {
    Table, Row, Col, Button, Modal, FormControl, FormGroup, ControlLabel, DropdownButton, MenuItem,
    Alert, Checkbox
} from "react-bootstrap"
import * as _ from "lodash"
import { Typeahead } from "react-bootstrap-typeahead"
const Dropzone = require("react-dropzone")
import DatePicker from "react-datepicker"
import * as upload from "superagent"
import * as moment from "moment"
import autobind from "autobind-decorator"

export type ModalType = "CREATE" | "EDIT" | "FILTER"
interface InlineComponentProps {
    field: any,
    modelChanged: any,
    additionalModels: any
    currentModel: any
    fetch?: any
    indent?: boolean
    showTitle?: boolean
    modalType?: ModalType
    width?: string
    height?: string
    contentType?: string
    item?: any
    parentModel: any,
    shouldRender?: boolean,
    urlPrefix?: string,
    urlSuffix?: string
}

interface ImageUploadProps extends InlineComponentProps {
    width: string
    height: string
}

class CruxComponentCreator {
    static create<M, P>(constants: any): any {
        const anchors: any = {}

        function getAdditionalModelsSingle(field: any): string[] {
            if (field.modelName) return [field.modelName]
            if (field.additionalModelsOverride) return field.additionalModelsOverride
            if (field.foreign && field.foreign.modelName) return [field.foreign.modelName]
            if (field.type === "nested") return getAdditionalModels(field)
            if (field.type === "iterable" && field.iterabletype) return getAdditionalModelsSingle(field.iterabletype)
            return []
        }

        function getAdditionalModels(parent: any): string[] {
            const result: any = _.flatten(_.map(parent.fields, (field: any) => getAdditionalModelsSingle(field)))
            const filtered = _.filter(result, (model: string) => model && model !== "" && !_.isEmpty(model))
            return _.uniq((parent.modelName) ? _.concat(filtered, parent.modelName) : filtered)
        }

        function getAnchors(field: any, anchors: any): any {
            if (field.anchor) {
                anchors[field.anchor] = field
            }

            if (!_.isEmpty(field.fields)) {
                _.forEach(field.fields, (field: any) => getAnchors(field, anchors))
            }

            if (!_.isEmpty(field.iterabletype)) {
                getAnchors(field.iterabletype, anchors)
            }

            if (!_.isEmpty(field.nestedtype)) {
                getAnchors(field.nestedtype, anchors)
            }
        }

        function mapStateToProps(state: any): any {
            const additionalModels = getAdditionalModels(constants)
            const stateRoot = !constants.stateRoot ? "crux" : (constants.stateRoot === "none" ? undefined : constants.stateRoot)
            const additionalModelValues = _.map(additionalModels, (model: any) => {
                return { "modelName": model, "value": stateRoot ? state[stateRoot][model] : state[model] }
            })
            return Object.assign({}, {
                [constants.modelName]: stateRoot ? state[stateRoot][constants.modelName] : state[constants.modelName],
                additionalModels: _.reduce(additionalModelValues, (sum: any, obj: any) => {
                    return Object.assign({}, sum, { [obj.modelName]: obj.value })
                }, {})
            })
        }

        const mapDispatchToProps = (dispatch: any) => {
            return {
                fetch: (model: string) => {
                    dispatch(fetchModel(model))
                },
                filter: (model: string, item: any, success: any, error: any) => {
                    dispatch(filterModel(model, item, success, error))
                },
                createOrModify: (model: string, item: any, edit: boolean, success: any, error: any) => {
                    dispatch(createOrModify(model, item, edit, success, error))
                },
                deleteModel: (model: string, item: any, success: any, error: any) => {
                    dispatch(deleteModel(model, item, success, error))
                }
            }
        }

        @autobind
        class ListIterableComponent extends React.Component<any, any> {
            constructor(props: any) {
                super(props)
                this.state = {}
            }

            modelChanged = (index: number, data: any, success: any, error: any) => {
                const modelCopy = JSON.parse(JSON.stringify(this.props.model))
                modelCopy[index] = data
                this.props.modelChanged(modelCopy, success, error)
            }

            render(): any {
                return <div>
                    {
                        _.map(this.props.model, (datum: any, index: number) => {
                            const field = this.props.field
                            if (!field.iterabletype) {
                                return <div key={index}>
                                    {datum}
                                </div>
                            } else {
                                if (!this.props) {
                                    return <div>{"Loading ..."}</div>
                                }

                                if (field.iterabletype.type === "iterable") {
                                    return <ListIterableComponent model={datum} field={field}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.modelChanged.bind(this, index)} />
                                }

                                if (field.iterabletype.type === "nested") {
                                    const filtered = _.filter(field.iterabletype.fields, (f: any) => f.display && _.has(datum, f.field))
                                    return _.map(filtered, (f: any, index: number) => {
                                        return <div key={index}>
                                            <div style={{ display: "inline-block" }}>{f.title + " : "}</div>
                                            <div style={{ display: "inline-block" }}><ListNestedComponent model={datum}
                                                additionalModels={this.props.additionalModels}
                                                field={f}
                                                modelChanged={this.modelChanged.bind(this, index)} />
                                            </div>
                                        </div>
                                    })
                                }

                                if (field.iterabletype.type === "select") {
                                    return <div key={index}><ListForeignComponent model={datum}
                                        field={field.iterabletype.foreign}
                                        additionalModels={this.props.additionalModels} />
                                    </div>
                                }

                                if (field.iterabletype.type === "checkbox") {
                                    return <ListCheckboxComponent model={datum} field={field} />
                                }

                                if (field.iterabletype.inlineEdit) {
                                    return <div key={index}><InlineEditComponent text={datum}
                                        handleChange={this.modelChanged.bind(this, index)} />
                                    </div>
                                } else {
                                    return <div key={index}>{datum}</div>
                                }
                            }
                        })
                    }
                </div>
            }
        }

        @autobind
        class ListForeignComponent extends React.Component<any, any> {
            constructor(props: any) {
                super(props)
                this.state = {}
            }

            render() {
                if (_.isEmpty(this.props.additionalModels)) {
                    return <div>{"Loading ....."}</div>
                }

                try {
                    if (_.isEmpty(this.props.model)) return <div />
                    const foreignDoc = this.props.additionalModels[this.props.field.modelName].find((datum: any) => datum[this.props.field.key] === this.props.model)
                    return foreignDoc ? <div>{_.get(foreignDoc, this.props.field.title)}</div> :
                        <div>{this.props.model + " - Bad Value"}</div>
                } catch (err) {
                    return <div>{"Loading ...."}</div>
                }
            }
        }

        @autobind
        class ListDateComponent extends React.Component<any, any> {
            render() {
                return <p>{this.props.field.showTimeSelect ? moment(this.props.model).format("LLL") : moment(this.props.model).format("ll")}</p>
            }
        }

        @autobind
        class ListCheckboxComponent extends React.Component<any, any> {
            render() {
                return <div>{"" + this.props.model}</div>
            }
        }

        @autobind
        class ListNestedComponent extends React.Component<any, any> {
            constructor(props: any) {
                super(props)
                this.state = {}
            }

            modelChanged = (data: any, success: any, error: any) => {
                const newModel = Object.assign({}, this.props.model, { [this.props.field.field]: data })
                this.props.modelChanged(newModel, success, error)
            }

            render(): any {
                if (this.props.field.type === "custom") {
                    const CustomComponent = this.props.field.customComponent(this.props.model, this.props.additionalModels, this.props.parentModel)
                    return <CustomComponent />
                } else {
                    const value = this.props.model[this.props.field.field]
                    const field = this.props.field
                    if (value === null || value === undefined) {
                        return <div />
                    }

                    if (typeof value === "object" && _.isEmpty(value) && _.isEmpty(field.foreign)) {
                        return <div />
                    }

                    if (!this.props) {
                        return <div>{"Loading ..."}</div>
                    }

                    if (field.type === "iterable") {
                        return <ListIterableComponent model={value} field={field}
                            additionalModels={this.props.additionalModels}
                            modelChanged={this.modelChanged} />
                    }

                    if (field.type === "datepicker") {
                        return <ListDateComponent model={value} field={field} />
                    }

                    if (field.type === "checkbox") {
                        return <ListCheckboxComponent model={value} field={field} />
                    }

                    if (field.type === "nested") {
                        return _.map(_.filter(field.fields, (f: any) => f.display && !_.isEmpty(value[f.field])), (f: any, index: number) => {
                            return <div key={index}>
                                <span>{f.title + " : "}</span>
                                <span><ListNestedComponent field={f} model={value}
                                    additionalModels={this.props.additionalModels}
                                    modelChanged={this.modelChanged} /></span>
                            </div>
                        })
                    }

                    if (!_.isEmpty(field.foreign)) {
                        return <ListForeignComponent model={this.props.model[field.field]} field={field.foreign}
                            additionalModels={this.props.additionalModels} />
                    }

                    if (field.inlineEdit) {
                        return <InlineEditComponent text={value} handleChange={this.modelChanged} />
                    } else {
                        return <div>{value}</div>
                    }
                }
            }
        }

        @autobind
        class ListClass extends React.Component<any, any> {
            componentDidMount() {
                this.fetchModels()
                getAnchors(constants, anchors)
            }

            fetchModels = () => {
                const additionalModels = _.filter(getAdditionalModels(constants), (model: string) => _.isEmpty(this.props.additionalModels[model]))
                additionalModels && additionalModels.forEach((model: string) => this.props.fetch(model))
            }

            constructor(props: any) {
                super(props)
                this.state = {
                    showCreateModal: false,
                    showFilterModal: false,
                    model: {},
                    filterModel: {}
                }
            }

            showCreateModal = () => {
                this.setState(Object.assign({}, this.state, { showCreateModal: true }))
            }

            closeCreateModal = () => {
                this.setState(Object.assign({}, this.state, { showCreateModal: false }))
            }

            showFilterModal() {
                this.setState(Object.assign({}, this.state, { showFilterModal: true }))
            }

            closeFilterModal() {
                this.setState(Object.assign({}, this.state, { showFilterModal: false }))
            }

            showEditModal = (model: M) => {
                return () => {
                    this.setState(Object.assign({}, this.state, { showEditModal: true, model }))
                }
            }

            closeEditModal = () => {
                this.setState(Object.assign({}, this.state, { showEditModal: false, model: {} }))
            }

            createOrEditSuccess = (data?: any) => {
                this.closeEditModal()
                this.closeCreateModal()
                if (constants.filterModal)
                    this.props.filter(constants.modelName, this.state.filterModel)
                else
                    this.fetchModel(constants.modelName)
            }

            resetFilter() {
                this.setState(Object.assign({}, this.state, { filterModel: {} }))
                this.fetchModel(constants.modelName)
            }

            fetchModel(modelName: string) {
                modelName && this.props.fetch(modelName)
            }

            filterSuccess(data: any) {
                this.closeFilterModal()
            }

            getDisplayText = (value: any, field: any, index?: number): any => {
            }

            handleSearch = (e: any) => {
                this.setState(Object.assign({}, this.state, { searchQuery: e.target.value }))
            }

            inlineEdit(item: any, success: any, error: any) {
                this.props.createOrModify(constants.modelName, item, true, this.inlineEditSuccess.bind(this, success), this.inlineEditError.bind(this, error))
            }

            inlineEditSuccess(success: any, data: any) {
                this.createOrEditSuccess(data)
                success(data)
            }

            inlineEditError(error: any, data: any) {
                error(data)
            }

            render() {
                const rows = _.isEmpty(constants.orderby) ? this.props[constants.modelName] : _.sortBy(this.props[constants.modelName], (doc: any) => {
                    return _.trim(doc[constants.orderby].toLowerCase())
                })
                const filteredRows = (!constants.enableSearch || _.isEmpty(this.state.searchQuery)) ? rows : _.filter(rows, (row: any) => JSON.stringify(row).toLowerCase().indexOf(this.state.searchQuery.toLowerCase()) !== -1)
                if (this.props[constants.modelName] && this.props[constants.modelName].error) {
                    return <div className="cf-main-content-container"
                        style={{ width: "100%", padding: 10, paddingLeft: 218 }}>
                        <Alert bsStyle="danger">{"Error occured while fetching " + constants.title}</Alert>
                    </div>
                }
                return (

                    <div className="cf-main-content-container" style={{ width: "100%", padding: 10, paddingLeft: 218 }}>
                        {constants.createModal && <div className="pull-right btn btn-primary btn-xs"
                            onClick={this.showCreateModal}>{"+ New " + constants.creationTitle}</div>}
                        {constants.filterModal &&
                            <div style={{ marginRight: 10 }} className="pull-right btn btn-primary btn-xs"
                                onClick={this.showFilterModal}>{"Filter " + constants.creationTitle}</div>}
                        {constants.filterModal &&
                            <div style={{ marginRight: 10 }} className="pull-right btn btn-primary btn-xs"
                                onClick={this.resetFilter}>{"Reset Filter "}</div>}
                        <div className="heading cf-container-header">{constants.title}</div>
                        {constants.enableSearch && <div>
                            <FormGroup style={{ paddingTop: "10px" }}>
                                <FormControl type="text" value={this.state.searchQuery} placeholder="Search"
                                    onChange={this.handleSearch} />
                            </FormGroup>
                        </div>}
                        <div style={{ marginTop: "10px" }} />

                        {_.isEmpty(this.props[constants.modelName]) ? <div>No {constants.title} in the system</div> :
                            <Table className="table table-striped cftable" striped bordered condensed hover>
                                <thead>
                                    <tr>
                                        {_.map(constants.fields.filter((field: any) => field.display), (field: any, index: any) =>
                                            <th key={index}>{field.title}</th>)}
                                        {constants.editModal && <th></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {_.map(filteredRows,
                                        (model: any, index: number) => {
                                            const filtered = constants.fields.filter((field: any) => field.display === true)
                                            return <tr key={index}>
                                                {_.map(filtered, (field: any, i: number) => {
                                                    return <td key={i}
                                                        style={(field.cellCss) ? field.cellCss : { margin: "0px" }}>
                                                        <div style={{ marginTop: 8 }}><ListNestedComponent field={field}
                                                            model={model}
                                                            additionalModels={this.props.additionalModels}
                                                            modelChanged={this.inlineEdit} />
                                                        </div>
                                                    </td>
                                                }
                                                )}
                                                {constants.editModal &&
                                                    <td key={2}><span style={{ marginLeft: "20px", marginTop: 8, color: "grey" }}
                                                        className="glyphicon glyphicon-pencil fas fa-pencil-alt"
                                                        aria-hidden="true" onClick={this.showEditModal(model)} />
                                                    </td>}
                                            </tr>
                                        })}

                                </tbody>
                            </Table>
                        }
                        {constants.createModal && this.state.showCreateModal &&
                            <ModalComponent
                                showModal={this.state.showCreateModal}
                                closeModal={this.closeCreateModal}
                                modalType={"CREATE"}
                                createOrModify={this.props.createOrModify}
                                createOrEditSuccess={this.createOrEditSuccess}
                                additionalModels={this.props.additionalModels} />
                        }
                        {constants.editModal && this.state.showEditModal &&
                            <ModalComponent
                                showModal={this.state.showEditModal}
                                closeModal={this.closeEditModal}
                                modalType={"EDIT"}
                                fetch={(model: string) => this.props.fetch(model)}
                                item={this.state.model}
                                createOrModify={this.props.createOrModify}
                                createOrEditSuccess={this.createOrEditSuccess}
                                deleteModel={this.props.deleteModel}
                                additionalModels={this.props.additionalModels} />
                        }
                        {constants.filterModal && this.state.showFilterModal &&
                            <ModalComponent
                                showModal={this.state.showFilterModal}
                                closeModal={this.closeFilterModal}
                                modalType={"FILTER"}
                                item={this.state.filterModel}
                                filterSuccess={this.filterSuccess}
                                filter={this.props.filter}
                                additionalModels={this.props.additionalModels} />
                        }
                    </div>
                )
            }
        }

        interface ModalComponentProps {
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
        }

        @autobind
        class ModalComponent extends React.Component<ModalComponentProps, any> {
            getRepField = () => {
                const repField = constants.fields.find((field: any) => field.representative)
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

            constructor(props: any) {
                super(props)
                this.state = {
                    item: this.props.modalType === "CREATE" ? {} : this.props.item,
                    deleteModal: false
                }
            }

            modalPerformOperation(modalType: ModalType) {
                return () => {
                    if (modalType === "FILTER") {
                        // Copies the filter items to persist the preference
                        Object.assign(this.props.item, this.state.item)
                        this.props.filter(constants.modelName, this.state.item, this.filterSuccess, this.filterError)
                    } else if (modalType === "CREATE" || modalType === "EDIT") {
                        this.props.createOrModify(constants.modelName, this.state.item, modalType === "EDIT", this.createOrEditSuccess, this.createOrEditError)
                    }
                }
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
                this.props.deleteModel(constants.modelName, this.state.item, this.createOrEditSuccess, this.createOrEditError)
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
                    dialogClassName={constants.largeEdit ? "large-modal" : ""}>
                    <Modal.Header closeButton>
                        {this.props.modalType === "CREATE" &&
                            <Modal.Title id="contained-modal-title">{"+ New " + constants.creationTitle}</Modal.Title>}
                        {this.props.modalType === "EDIT" && <Modal.Title
                            id="contained-modal-title">{"Edit " + constants.creationTitle + " - " + this.props.item[this.getRepField().field]}</Modal.Title>}
                        {this.props.modalType === "FILTER" &&
                            <Modal.Title id="contained-modal-title">{"Filter " + constants.creationTitle}</Modal.Title>}
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
                        <NestedEditComponent field={constants} modalType={this.props.modalType}
                            additionalModels={this.props.additionalModels} fetch={this.props.fetch}
                            modelChanged={this.modelChanged} currentModel={this.state.item}
                            showTitle={false}
                            parentModel={{}}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        {this.props.modalType === "EDIT" &&
                            <div className="btn btn-danger" style={{ float: "left" }} onClick={this.openDeleteModal}>
                                Delete</div>}
                        {this.state.deleteModal &&
                            <Modal show={this.state.deleteModal} onHide={this.closeDeleteModal} container={this}>
                                <Modal.Header closeButton>
                                    {"Delete " + constants.creationTitle}
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
                        <div className="btn btn-primary"
                            onClick={this.modalPerformOperation(this.props.modalType)}>{this.props.modalType === "EDIT" ? "Save" : this.props.modalType === "CREATE" ? "Create" : "Filter"}</div>
                        <div className="btn btn-secondary" onClick={this.closeModal}>Cancel</div>
                    </Modal.Footer>
                </Modal>
            }
        }


        @autobind
        class InlineEditComponent extends React.Component<any, any> {
            constructor(props: any) {
                super(props)
                this.state = { text: this.props.text, edit: false, loading: false }
            }

            componentWillReceiveProps(nextProps: any) {
                this.setState({ text: nextProps.text, edit: false, loading: false })
            }

            render() {
                return <div>
                    {
                        this.state.edit ? <input type="text" value={this.state.text}
                            onKeyPress={this.handleEnter}
                            style={{ paddingTop: 5 }}
                            onChange={this.handleChange}
                        /> :
                            <span onClick={this.startEditing}>{this.state.text}</span>

                    }
                    {this.state.loading &&
                        <i className="fa fa-spinner fa-spin" style={{ fontSize: 12, marginLeft: 10 }} />}
                </div>
            }

            startEditing() {
                this.setState({ ...this.state, edit: true })
            }

            stopEditing() {
                this.setState({ ...this.state, edit: false })
            }

            startLoading() {
                this.setState({ ...this.state, loading: true, edit: false })
            }

            stopLoading() {
                this.setState({ ...this.state, loading: false })
            }

            handleChange(e: any) {
                this.setState({ ...this.state, text: e.target.value })
            }

            handleEnter(e: any) {
                if (e.key === "Enter") {
                    this.startLoading()
                    this.props.handleChange(this.state.text, this.success, this.error)
                }
            }

            success() {
                this.stopEditing()
                this.stopLoading()
            }

            error(err: any) {
                this.stopLoading()
            }
        }

        @autobind
        class IterableEditComponent extends React.Component<ImageUploadProps | InlineComponentProps, any> {
            constructor(props: any) {
                super(props)
                this.state = {
                    model: _.isEmpty(this.props.currentModel) ? [] : JSON.parse(JSON.stringify(this.props.currentModel))
                }
            }

            componentWillReceiveProps(nextProps: any) {
                if (nextProps.currentModel) {
                    this.setState(Object.assign({}, this.state, { model: JSON.parse(JSON.stringify(nextProps.currentModel)) }))
                }
            }

            render() {
                // console.log("iterable",  this.props.field.title, " Parent ", this.props.parentModel)
                if (!this.props.field.iterabletype) {
                    console.error("Did you forget to add a iterabletype to the field ? Possible culprit:", this.props.field)
                }

                if (!this.props.field.iterabletype.title) {
                    console.error("Did you forget to add a title to the iterabletype ? Possible culprit:", this.props.field.iterabletype)
                }

                return <div>
                    {!(this.props.field.style && this.props.field.style.hideLabel) &&
                        <label onClick={this.collapseToggle} style={{
                            fontSize: "10px",
                            marginRight: "10px"
                        }}>{this.props.field.title.toUpperCase()}</label>}
                    <div
                        style={this.state.collapsed ? { display: "none" } : (!_.isEmpty(this.state.model) ? ({ padding: 0 }) : { padding: 0 })}>
                        {
                            _.map(this.state.model, ((datum: any, index: any) => {
                                const parentModel = {
                                    data: this.state.model,
                                    parentModel: this.props.parentModel
                                }
                                if (this.props.field.iterabletype && this.props.field.iterabletype.type === "select") {
                                    return <div key={index}
                                        style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                            padding: "5px 0px",
                                            display: "inline-block",
                                            marginRight: "30px"
                                        } : { padding: "5px 0px" }}>
                                        <div style={{ display: "inline-block" }}><SelectComponent key={index}
                                            currentModel={this.state.model[index]}
                                            field={this.props.field.iterabletype}
                                            additionalModels={this.props.additionalModels}
                                            modelChanged={this.fieldChanged(index)}
                                            showTitle={false}
                                            parentModel={parentModel}
                                        />
                                        </div>
                                        <span style={{ marginLeft: "10px", color: "grey" }}
                                            className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                            onClick={this.remove.bind(this, index)} />
                                    </div>
                                }

                                if (this.props.field.iterabletype && this.props.field.iterabletype.type === "imageUpload") {
                                    return <div key={index}
                                        style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                            padding: "5px 0px",
                                            display: "inline-block",
                                            marginRight: "30px"
                                        } : { padding: "5px 0px" }}>
                                        <div style={{ display: "inline-block" }}><ImageUploadComponent key={index}
                                            width={this.props.width}
                                            height={this.props.height}
                                            contentType={this.props.contentType}
                                            currentModel={this.state.model[index]}
                                            field={this.props.field.iterabletype}
                                            additionalModels={this.props.additionalModels}
                                            modelChanged={this.fieldChanged(index)}
                                            showTitle={false}
                                            parentModel={parentModel}
                                        />
                                        </div>
                                        <span style={{ marginLeft: "10px", color: "grey" }}
                                            className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                            onClick={this.remove.bind(this, index)} />
                                    </div>
                                }

                                if (this.props.field.iterabletype && this.props.field.iterabletype.type === "datepicker") {
                                    return <div key={index}
                                        style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                            padding: "5px 0px",
                                            display: "inline-block",
                                            marginRight: "30px"
                                        } : { padding: "5px 0px" }}>
                                        <div style={{ display: "inline-block" }}><DatePickerComponent key={index}
                                            currentModel={this.state.model[index]}
                                            field={this.props.field.iterabletype}
                                            additionalModels={this.props.additionalModels}
                                            modelChanged={this.fieldChanged(index)}
                                            showTitle={false}
                                            parentModel={parentModel}
                                        />
                                        </div>
                                        <span style={{ marginLeft: "10px", color: "grey" }}
                                            className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                            onClick={this.remove.bind(this, index)} />
                                    </div>
                                }

                                if (this.props.field.iterabletype && this.props.field.iterabletype.type === "typeahead") {
                                    return <div key={index}
                                        style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                            padding: "5px 0px",
                                            display: "inline-block",
                                            marginRight: "30px"
                                        } : { padding: "5px 0px" }}>
                                        <div style={{ display: "inline-block" }}><TypeaheadComponent key={index}
                                            currentModel={this.state.model[index]}
                                            fetch={this.props.fetch}
                                            field={this.props.field.iterabletype}
                                            additionalModels={this.props.additionalModels}
                                            modelChanged={this.fieldChanged(index)}
                                            showTitle={false}
                                            parentModel={parentModel} />
                                        </div>
                                        <span style={{ marginLeft: "10px", color: "grey" }}
                                            className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                            onClick={this.remove.bind(this, index)} />
                                    </div>
                                }

                                if (this.props.field.iterabletype && this.props.field.iterabletype.type === "nested") {
                                    return <div key={index}
                                        style={this.props.field.iterabletype.style && this.props.field.iterabletype.style.border === "none" ? {} : {
                                            border: "1px solid #EEE",
                                            padding: "10px"
                                        }}>
                                        <div style={{ display: "inline-block" }}><NestedEditComponent key={index}
                                            currentModel={this.state.model[index]}
                                            fetch={this.props.fetch}
                                            field={this.props.field.iterabletype}
                                            additionalModels={this.props.additionalModels}
                                            modelChanged={this.fieldChanged(index).bind(this, undefined)}
                                            showTitle={false}
                                            indent={false}
                                            modalType={this.props.modalType}
                                            parentModel={parentModel} />
                                        </div>
                                        <div style={{ marginLeft: "10px", color: "grey" }}
                                            className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                            onClick={this.remove.bind(this, index)} />
                                    </div>
                                }

                                if (this.props.field.iterabletype && this.props.field.iterabletype.type === "recursive") {
                                    return <div key={index} style={{ border: "1px solid #EEE", padding: "10px" }}>
                                        <NestedEditComponent key={index} currentModel={this.state.model[index]}
                                            fetch={this.props.fetch}
                                            field={Object.assign({}, anchors[this.props.field.iterabletype.recursivetype], this.props.field.iterabletype.recursiveOverrides)}
                                            additionalModels={this.props.additionalModels}
                                            modelChanged={this.fieldChanged(index).bind(this, undefined)}
                                            showTitle={true} indent={true}
                                            modalType={this.props.modalType}
                                            parentModel={parentModel} />
                                        <div style={{ marginLeft: "10px", color: "grey" }}
                                            className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                            onClick={this.remove.bind(this, index)} />
                                    </div>
                                }

                                if (this.props.field.iterabletype && this.props.field.iterabletype.type === "checkbox") {
                                    return <div style={{ display: "inline-block" }}>
                                        <CheckboxComponent key={index} currentModel={this.state.model[index]}
                                            field={this.props.field.iterabletype}
                                            additionalModels={this.props.additionalModels}
                                            modelChanged={this.fieldChanged(index)} showTitle={false}
                                            parentModel={parentModel} />
                                        <div style={{ marginLeft: "10px", color: "grey" }}
                                            className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                            onClick={this.remove.bind(this, index)} />
                                    </div>
                                }

                                if (this.props.field.iterabletype && this.props.field.iterabletype.type === "bigtext") {
                                    return <div key={index}>
                                        <textarea key={index} value={datum}
                                            onChange={this.handleChange.bind(this, index)} style={{ width: 250 }} />
                                        <div style={{ marginLeft: "10px", color: "grey" }}
                                            className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                            onClick={this.remove.bind(this, index)} />
                                    </div>
                                }

                                return <div key={index}>
                                    <input key={index} type="text" value={datum}
                                        onChange={this.handleChange.bind(this, index)}
                                        style={this.props.field.iterabletype === "tinyinput" ? {
                                            width: 64,
                                            paddingTop: 5
                                        } : { width: 200, paddingTop: 5 }}
                                    />
                                    <div style={{ marginLeft: "10px", color: "grey" }}
                                        className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                        onClick={this.remove.bind(this, index)} />
                                </div>
                            }))
                        }
                    </div>
                    <div className="btn btn-xs btn-passive" style={{ marginTop: "5px" }} onClick={this.createNew}>
                        +Add {this.props.field.iterabletype.title}</div>
                </div>
            }

            handleChange = (index: any, event: any) => {
                const modelCopy = JSON.parse(JSON.stringify(this.state.model))
                modelCopy[index] = event.target.value
                this.props.modelChanged(modelCopy)
            }

            fieldChanged = (index: any) => {
                const self = this
                return function (field: any, value: any) {
                    const modelCopy = JSON.parse(JSON.stringify(self.state.model))
                    modelCopy[index] = value
                    self.props.modelChanged(modelCopy)
                }
            }

            createNew = () => {
                if (this.props.field.iterabletype.type === "nested") {
                    this.props.modelChanged(_.concat(this.state.model, {}))
                } else {
                    this.props.modelChanged(_.concat(this.state.model, ""))
                }
            }

            remove = (index: any) => {
                const modelCopy = JSON.parse(JSON.stringify(this.state.model))
                _.pullAt(modelCopy, index)
                this.props.modelChanged(modelCopy)
            }

            collapseToggle = () => {
                this.setState(Object.assign({}, this.state, { collapsed: !this.state.collapsed }))
            }
        }

        @autobind
        class SelectComponent extends React.Component<InlineComponentProps, any> {
            // constructor(props: any) {
            //     super(props)
            //     this.state = {
            //         isTransformed: false
            //     }
            // }
            //
            // componentWillUpdate(nextProps: any, nextState: any) {
            //
            //     if (this.state.isTransformed) {
            //         // console.log("nextProps", nextProps, "currentProps", this.props)
            //     }
            // }

            render() {
                const hideLabel = this.props.field.style && this.props.field.style.hideLabel
                if (!this.props.field.title && !hideLabel) {
                    console.error("Did you forget to add a \"title\" in the select field. Possible culprit: ", this.props.field)
                }
                let optionsData = []
                if (this.props.field.foreign.transform) {
                    if (typeof this.props.field.foreign.transform === "function") {
                        optionsData = this.props.field.foreign.transform(this.props.field.foreign.modelName, this.props.currentModel, this.props.additionalModels, this.props.parentModel)
                    } else {
                        console.error("Did you forget to add \"function\" in the transform field. Function should return an array. Possible culprit: ", this.props.field)
                    }

                } else {
                    optionsData = _.isEmpty(this.props.field.foreign.orderby)
                        ? this.props.additionalModels[this.props.field.foreign.modelName]
                        : _.sortBy(this.props.additionalModels[this.props.field.foreign.modelName], (doc: any) => _.trim(doc[this.props.field.foreign.orderby].toLowerCase()))
                }
                let foreignTitle = !hideLabel ? "Choose " + this.props.field.title : "Choose"
                if (this.props.field.foreign) {
                    if (!this.props.field.foreign.key) {
                        console.error("Did you forget to add a \"key\" field in foreign . Possible culprit: ", this.props.field)
                    }
                    if (!this.props.field.foreign.title) {
                        console.error("Did you forget to add a \"title\" field in foreign . Possible culprit: ", this.props.field)
                    }
                    if (!_.isEmpty(this.props.currentModel)) {
                        const foreignDoc = _.find(optionsData, (doc: any) => {
                            if (this.props.field.valueType === "object") {
                                return doc.id === this.props.currentModel.id
                            }
                            return doc[this.props.field.foreign.key] === this.props.currentModel
                        })
                        if (_.isEmpty(foreignDoc)) {
                            foreignTitle = this.props.currentModel + " Bad Value"
                        } else {
                            foreignTitle = foreignDoc[this.props.field.foreign.title]
                        }
                    }
                } else {
                    console.error("Did you forget to add a \"foreign\" field with a type: \"select\". Possible culprit: ", this.props.field)
                }
                return <div>
                    {
                        this.props.showTitle && !_.isEmpty(this.props.field.title) && !hideLabel &&
                        <div><label style={{
                            fontSize: "10px",
                            marginRight: "10px"
                        }}>{this.props.field.title.toUpperCase()}</label><br /></div>
                    }
                    <DropdownButton bsSize="small" style={{ width: "auto" }} id={this.props.field.field + "_dropdown"}
                        title={foreignTitle}>
                        {
                            _.map(optionsData, ((doc: any, index: any) =>
                                <MenuItem onSelect={(eventKey: any) => this.select(this.props.field, eventKey)}
                                    key={index}
                                    eventKey={this.props.field.valueType === "object" ? doc : doc[this.props.field.foreign.key]}>{doc[this.props.field.foreign.title]}</MenuItem>))
                        }
                    </DropdownButton></div>
            }

            select = (field: any, eventKey: any) => {
                // this.setState({
                //     isTransformed : true
                // })
                this.props.modelChanged(field, eventKey)
            }
        }

        @autobind
        class CheckboxComponent extends React.Component<InlineComponentProps, any> {
            render() {
                return <div>
                    <div><label style={{
                        fontSize: "10px",
                        marginRight: "10px"
                    }}>{this.props.field.title.toUpperCase()}</label><br /></div>
                    <Checkbox bsClass="custom-checkbox" onChange={this.handleCheckbox}
                        checked={this.props.currentModel === true} />
                </div>
            }

            handleCheckbox = () => {
                const newValue = (this.props.currentModel === true) ? false : true
                this.props.modelChanged(this.props.field, newValue)
            }
        }

        @autobind
        class TypeaheadComponent extends React.Component<InlineComponentProps, any> {
            render() {
                const options = _.isEmpty(this.props.field.foreign.orderby)
                    ? this.props.additionalModels[this.props.field.foreign.modelName]
                    : _.sortBy(this.props.additionalModels[this.props.field.foreign.modelName], (doc: any) => _.trim(doc[this.props.field.foreign.orderby].toLowerCase()))

                const selected = _.find(options, (option: any) => option[this.props.field.foreign.key] === this.props.currentModel)
                return <div>
                    {
                        this.props.showTitle &&
                        !(this.props.field.style && this.props.field.style.hideLabel) &&
                        <div>
                            <label style={{
                                fontSize: "10px",
                                marginRight: "10px"
                            }}>{this.props.field.title.toUpperCase()}</label>
                            {this.props.field.showRefresh &&
                                <span style={{ float: "right", fontSize: "10px" }}>
                                    <span style={{ marginLeft: "20px", color: "grey" }}
                                        className="glyphicon glyphicon-refresh" aria-hidden="true"
                                        onClick={this.refreshMovements} />
                                </span>}

                            <br />
                        </div>
                    }
                    <Typeahead labelKey={this.props.field.foreign.title} onChange={this.handleChange} options={options}
                        selected={selected ? [selected] : undefined} />
                </div>
            }

            refreshMovements = () => {
                this.props.fetch("movements")
            }

            handleChange = (selected: any) => {
                if (!_.isEmpty(selected)) {
                    const newObject = selected[0]
                    this.props.modelChanged(this.props.field, newObject[this.props.field.foreign.key])
                }
            }
        }

        @autobind
        class NestedEditComponent extends React.Component<InlineComponentProps, any> {
            constructor(props: any) {
                super(props)
                this.state = { collapsed: this.props.field.collapsed }
            }

            getEditable(field: any, modalType: string) {
                if (modalType === "CREATE" && _.has(field, "creatable")) {
                    return field.creatable === true
                }

                if (modalType === "CREATE" || modalType === "EDIT") {
                    return field.editable === true
                }

                return false
            }

            render(): any {
                // console.log("nested", this.props.field.title, " Parent " ,this.props.parentModel)
                if (_.isEmpty(this.props) || _.isEmpty(this.props.field)) {
                    console.error("Nested component got empty field prop. Check the parent component. Props:", this.props)
                    return <div />
                }

                if (_.isEmpty(this.props.field.fields)) {
                    console.error("Attribute fields missing in the nested component config", this.props.field)
                    return <div />
                }

                let fields

                if (this.props.modalType === "CREATE" || this.props.modalType === "EDIT") {
                    fields = _.filter(this.props.field.fields, (field: any) => this.getEditable(field, this.props.modalType))
                } else if (this.props.modalType === "FILTER") {
                    fields = _.filter(this.props.field.fields, (field: any) => field.filterParameter === true)
                }
                // Filter out the filed not matching specified conditional field
                fields = _.filter(fields, (field: any) => {
                    if (field.conditionalField) {
                        return this.props.currentModel && this.props.currentModel[field.conditionalField] === field.conditionalValue
                    }
                    return true
                })

                fields = _.filter(fields, (field: any) => {
                    if (field.shouldRender) {
                        if (typeof field.shouldRender === "function") {
                            if (field.shouldRender.length !== 4) {
                                console.error("No. of arguments don't match in the shouldRender function. Function should have 4 args. Possible culprit: ", field.field)
                                return false
                            }
                            return field.shouldRender(field.modelName, this.props.currentModel, this.props.additionalModels, this.props.parentModel)
                        } else {
                            console.error("Did you forget to add \"function\" in the shouldRender field. Function should return boolean.")
                            return false
                        }
                    }
                    return true
                })

                const wysiwygFields = _.filter(fields, (field: any) => (field.wysiwyg === true) && (field.type === "custom"))
                return <div style={this.props.indent ? { border: "1px solid #EEE", padding: "10px" } : { padding: 0 }}>
                    {this.props.showTitle && !(this.props.field.style && this.props.field.style.hideLabel) &&
                        <div onClick={this.collapseToggle} style={{ cursor: "pointer" }}><label
                            style={{ fontSize: "10px", marginRight: "10px" }}>{this.props.field.title.toUpperCase()}</label>
                        </div>}
                    <div style={this.state.collapsed ? { display: "none" } : { display: "block" }}>
                        <div style={{ display: "inline-block" }}>
                            {
                                _.map(_.filter(fields, (field: any) => this.getEditable(field, this.props.modalType) || field.filterParameter === true), (field: any, index: any) => {
                                    const currentModelWithParent = { data: this.props.currentModel, parentModel: this.props.parentModel }
                                    return <div key={index} style={(this.props.field.displayChildren === "inline") ? {
                                        display: "inline-block",
                                        marginRight: "10px",
                                        marginBottom: "30px",
                                        verticalAlign: "top"
                                    } : { marginBottom: "30px", marginRight: "10px" }}>
                                        <div>
                                            {
                                                field.type === "select" &&
                                                <SelectComponent field={field}
                                                    additionalModels={this.props.additionalModels}
                                                    modelChanged={this.select}
                                                    currentModel={(this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}}
                                                    showTitle={true}
                                                    parentModel={currentModelWithParent}
                                                />
                                            }
                                            {
                                                field.type === "imageUpload" &&
                                                <ImageUploadComponent field={field}
                                                    width={this.props.width}
                                                    height={this.props.height}
                                                    contentType={this.props.contentType}
                                                    additionalModels={this.props.additionalModels}
                                                    modelChanged={this.select}
                                                    currentModel={(this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : undefined}
                                                    showTitle={true}
                                                    parentModel={currentModelWithParent}
                                                />
                                            }
                                            {
                                                field.type === "datepicker" &&
                                                <DatePickerComponent field={field}
                                                    additionalModels={this.props.additionalModels}
                                                    modelChanged={this.select}
                                                    currentModel={(this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : undefined}
                                                    showTitle={true}
                                                    parentModel={currentModelWithParent}
                                                />
                                            }
                                            {
                                                field.type === "typeahead" &&
                                                <TypeaheadComponent field={field}
                                                    additionalModels={this.props.additionalModels}
                                                    fetch={this.props.fetch} modelChanged={this.select}
                                                    currentModel={(this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}}
                                                    showTitle={true}
                                                    parentModel={currentModelWithParent}
                                                />
                                            }
                                            {
                                                field.type === "nested" &&
                                                <NestedEditComponent field={field} modalType={this.props.modalType}
                                                    additionalModels={this.props.additionalModels}
                                                    fetch={this.props.fetch}
                                                    modelChanged={this.select.bind(this, field)}
                                                    indent={false}
                                                    currentModel={(this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}}
                                                    showTitle={true}
                                                    parentModel={currentModelWithParent}
                                                />
                                            }
                                            {
                                                field.type === "iterable" &&
                                                <IterableEditComponent field={field} modalType={this.props.modalType}
                                                    additionalModels={this.props.additionalModels}
                                                    fetch={this.props.fetch}
                                                    modelChanged={this.select.bind(this, field)}
                                                    indent={true}
                                                    currentModel={(this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : []}
                                                    parentModel={currentModelWithParent}
                                                />
                                            }
                                            {
                                                field.type === "checkbox" &&
                                                <CheckboxComponent field={field}
                                                    additionalModels={this.props.additionalModels}
                                                    modelChanged={this.select}
                                                    currentModel={(this.props.currentModel !== undefined && this.props.currentModel[field.field] !== undefined) ? this.props.currentModel[field.field] : {}}
                                                    showTitle={true}
                                                    parentModel={currentModelWithParent}
                                                />
                                            }
                                            {
                                                field.type === "bigtext" &&
                                                <div>
                                                    {!_.isEmpty(field.title) && <span><label style={{
                                                        fontSize: "10px",
                                                        marginRight: "10px"
                                                    }}>{field.title.toUpperCase()}</label><br /></span>}
                                                    <textarea
                                                        value={this.props.currentModel ? this.props.currentModel[field.field] : ""}
                                                        onChange={this.handleChange.bind(this, field)}
                                                        style={{ width: 250 }} />
                                                </div>
                                            }
                                            {
                                                field.type !== "iterable" && field.type !== "select" && field.type !== "typeahead" && field.type !== "nested" && field.type !== "bigtext" && field.type !== "checkbox" &&
                                                field.type !== "datepicker" && field.type !== "imageUpload" &&
                                                <div>
                                                    {!_.isEmpty(field.title) && <span><label style={{
                                                        fontSize: "10px",
                                                        marginRight: "10px"
                                                    }}>{field.title.toUpperCase()}</label><br /></span>}
                                                    <input type="text"
                                                        value={this.props.currentModel ? this.props.currentModel[field.field] : ""}
                                                        onChange={this.handleChange.bind(this, field)}
                                                        style={field.type === "tinyinput" ? {
                                                            width: 64,
                                                            paddingTop: 5
                                                        } : { width: 200, paddingTop: 5 }}
                                                    />
                                                </div>
                                            }
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                        {
                            !_.isEmpty(wysiwygFields) &&
                            <div style={{
                                display: "inline-block",
                                marginLeft: "50px",
                                maxWidth: "300px",
                                verticalAlign: "top"
                            }}>
                                {
                                    _.map(wysiwygFields, (field: any, index: number) => {
                                        const CustomComponent = field.customComponent(this.props.currentModel, this.props.additionalModels, this.props.parentModel)
                                        return <div key={index}>
                                            <label style={{
                                                fontSize: "10px",
                                                marginRight: "10px"
                                            }}>{field.title.toUpperCase()}</label>
                                            <CustomComponent key={index} />
                                        </div>
                                    })
                                }
                            </div>
                        }
                    </div>
                </div>
            }

            select = (field: any, eventKey: any) => {
                this.props.modelChanged(Object.assign({}, this.props.currentModel, { [field.field]: eventKey }))
            }

            handleChange = (field: any, event: any) => {
                const newModel = Object.assign({}, this.props.currentModel, { [field.field]: event.target.value })
                this.props.modelChanged(newModel)
            }

            collapseToggle = () => {
                this.setState(Object.assign({}, this.state, { collapsed: !this.state.collapsed }))
            }
        }

        @autobind
        class ImageUploadComponent extends React.Component<InlineComponentProps, any> {
            constructor(props: any) {
                super(props)
                this.state = {
                    inProgress: false
                }
            }

            onDrop(files: any, width: string, height: string, contentType: string) {
                const formData = new FormData()
                formData.append("images", files[0])
                if (width) {
                    formData.append("width", width)
                }
                if (height) {
                    formData.append("height", height)
                }
                this.setState(Object.assign({}, this.state, { inProgress: true }))
                if (this.props.item && this.props.item["contentType"] && this.props.item["contentType"] !== contentType) {
                    contentType = this.props.item["contentType"]
                }
                upload.post("/content/" + contentType + "/upload/").send(formData)
                    .end((err: any, res: any) => {
                        this.setState(Object.assign({}, this.state, { inProgress: false }))
                        if (res.status !== 200) {
                            const data = JSON.parse(res.text)
                            alert("Error: " + data.message)
                        }
                        else {
                            const data = JSON.parse(res.text)
                            this.props.modelChanged(this.props.field, data.url)
                            alert("File uploaded successfully")
                        }
                    })
            }

            render() {
                return (
                    <div>
                        <Dropzone style={{ width: "140px", textAlign: "center", color: "#E2356F" }}
                            onDrop={(data: any) => {
                                this.onDrop(data, this.props.field.width, this.props.field.height, this.props.field.contentType)
                            }} multiple={true}>
                            <div style={{ textAlign: "left", color: "#E2356F" }}>Upload {this.props.field.title}</div>
                            {this.state.inProgress &&
                                <img src="./images/loadingGif.gif" style={{ width: "112px", textAlign: "center" }} />}
                            {this.props.currentModel &&
                                <div><a target="_blank" style={{ color: "#4292f4" }} href={this.props.field.urlPrefix + this.props.currentModel + this.props.field.urlSuffix}> {this.props.contentType}
                                    Link </a></div>}
                        </Dropzone>
                    </div>
                )
            }
        }

        @autobind
        class DatePickerComponent extends React.Component<InlineComponentProps, any> {
            constructor(props: any) {
                super(props)
                // this.state = this.props.field.showTimeSelect ? {dateTime: moment()} : {dateTime: moment(moment().format("ll"))}
                this.state = {}
            }
            // componentDidMount() {
            //
            // }

            componentWillReceiveProps(nextProps: any) {
                if (nextProps.currentModel) {
                    this.setState({ ...this.state, dateTime: moment(nextProps.currentModel) })
                }
            }

            render() {
                return (
                    <div>
                        <label style={{
                            fontSize: "10px",
                            marginRight: "10px"
                        }}>{this.props.field.title.toUpperCase()}</label><br />
                        <DatePicker
                            showTimeSelect={!!this.props.field.showTimeSelect}
                            timeIntervals={30}
                            dateFormat={this.props.field.showTimeSelect ? "LLL" : "LL"}
                            timeFormat="HH:mm"
                            selected={this.state.dateTime}
                            onChange={this.handleChange}
                            className="autowidth"
                        />
                    </div>
                )
            }

            handleChange(selected: any) {
                this.props.modelChanged(this.props.field, selected)
            }
        }

        return connect(mapStateToProps, mapDispatchToProps)(ListClass)
    }
}

export { CruxComponentCreator }