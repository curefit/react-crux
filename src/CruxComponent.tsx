import * as React from "react"
import { connect } from "react-redux"
import {
    createOrModify, deleteModel, fetchModel, filterModel, successCustomModal, failureCustomModal,
    searchModel
} from "./Actions"
import * as _ from "lodash"
import { getAdditionalModels, getAnchors } from "./util"
import autobind from "autobind-decorator"
import { Alert, FormControl, FormGroup, Table } from "react-bootstrap"
import { ModalComponent } from "./components/ModalComponent"
import { ListNestedComponent } from "./components/ListNestedComponent"
import { PaginationComponent } from "./components/PaginationComponent"

export type ModalType = "CREATE" | "EDIT" | "FILTER" | "CUSTOM"
export interface InlineComponentProps {
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
    constants?: any,
    anchors?: any,
    readonly?: boolean
}

export { ModalComponent } from './components/ModalComponent'

export class CruxComponentCreator {
    static create<M, P>(constants: any): any {
        let anchors: any = {}

        function mapStateToProps(state: any, ownProps: any): any {
            const additionalModels = getAdditionalModels(constants)
            const stateRoot = !constants.stateRoot ? "crux" : (constants.stateRoot === "none" ? undefined : constants.stateRoot)
            const additionalModelValues = _.map(additionalModels, (model: any) => {
                return { "modelName": model, "value": stateRoot ? state[stateRoot][model] : state[model] }
            })
            return Object.assign({}, {
                [constants.modelName]: stateRoot ? state[stateRoot][constants.modelName] : state[constants.modelName],
                additionalModels: _.reduce(additionalModelValues, (sum: any, obj: any) => {
                    return Object.assign({}, sum, { [obj.modelName]: obj.value })
                }, {}),
                queryParams: ownProps ? ownProps.queryParams : undefined
            })
        }

        const mapDispatchToProps = (dispatch: any) => {
            return {
                fetch: (model: string, success: any, error: any, queryParams: any) => {
                    dispatch(fetchModel(model, success, error, queryParams))
                },
                filter: (model: string, item: any, success: any, error: any, queryParams: any) => {
                    dispatch(filterModel(model, item, success, error, queryParams))
                },
                createOrModify: (model: string, item: any, edit: boolean, success: any, error: any, queryParams: any) => {
                    dispatch(createOrModify(model, item, edit, success, error, queryParams))
                },
                deleteModel: (model: string, item: any, success: any, error: any, queryParams: any) => {
                    dispatch(deleteModel(model, item, success, error, queryParams))
                },
                successCustomModal: (data: any, type: string, model: string) => {
                    dispatch(successCustomModal(data, type, model))
                },
                failureCustomModal: (err: any, model: string, type: string) => {
                    dispatch(failureCustomModal(type, err, model))
                },
                searchModel: (model: string, id: string, success: any) => {
                    dispatch(searchModel(model, id, success))
                }
            }
        }

        @autobind
        class ListClass extends React.Component<any, any> {

            componentDidMount() {
                this.fetchModels(this.props)
                anchors = getAnchors(constants)
            }

            fetchModels = (props: any) => {
                const additionalModels = _.filter(getAdditionalModels(constants), (model: string) => this.checkAdditionalModel(model))
                additionalModels && additionalModels.forEach((model: string) => this.fetchServerData(model, props))
            }

            checkAdditionalModel(modelName: string) {
                if ((modelName === constants.modelName && constants.paginate) ||
                    !Array.isArray(this.props.additionalModels[modelName])) {
                    return true
                }
                return _.isEmpty(this.props.additionalModels[modelName])
            }

            fetchServerData(modelName: string, props: any) {
                if (modelName === constants.modelName) {
                    this.getDefaultPageSize() ?
                        props.filter(modelName, { limit: constants.paginate.defaultPageSize }, this.searchByQueryParams, undefined, props.queryParams)
                        : props.fetch(modelName, this.searchByQueryParams, undefined, props.queryParams)
                } else {
                    props.fetch(modelName, undefined, undefined, props.queryParams)
                }
            }

            searchByQueryParams(data: any) {
                const params = new URLSearchParams(this.props.location.search)
                const searchId = params.get("id")
                const searchField = params.get("field")
                if (searchId && searchField) {
                    const searchData = data.filter((x: any) => x[searchField] === searchId);
                    if (searchData.length) {
                        this.setState({
                            showEditModal: true,
                            model: searchData[0]
                        })
                    } else {
                        this.props.searchModel(constants.modelName, searchId, (searchModel: any) => {
                            if (searchModel) {
                                this.setState({
                                    showEditModal: true,
                                    model: searchModel
                                })
                            }
                        })
                    }
                }
            }

            constructor(props: any) {
                super(props)
                this.state = {
                    showCreateModal: false,
                    showFilterModal: false,
                    model: {},
                    showCustomModal: false,
                    filterModel: {
                        paginate: {
                            currentPage: 1,
                            currentPageSize: this.getDefaultPageSize()
                        },
                        limit: this.getDefaultPageSize(),
                        skip: 0
                    }
                }
            }

            getDefaultPageSize = () => {
                return constants.paginate && constants.paginate.defaultPageSize || ''
            }

            componentWillReceiveProps(nextProps: any) {
                console.log("New props: ", nextProps, " ", this.props.queryParams)
                if (!_.isEqual(this.props.queryParams, nextProps.queryParams)) {
                    console.log("Fetching again : ", nextProps, this.props.queryParams)
                    this.fetchModels(nextProps)
                }
            }

            showCreateModal = () => {
                this.setState({ showCreateModal: true })
            }

            closeCreateModal = () => {
                this.setState({ showCreateModal: false })
            }

            showFilterModal() {
                this.setState({ showFilterModal: true })
            }

            closeFilterModal() {
                this.setState({ showFilterModal: false })
            }

            showEditModal = (model: M) => {
                return () => {
                    this.setState({ showEditModal: true, model })
                }
            }

            showCustomModal = (model: any) => {
                this.setState({ showCustomModal: true, model })
            }

            closeCustomModal = () => {
                this.setState({ showCustomModal: false, model: {} })
            }

            closeEditModal = () => {
                this.setState({ showEditModal: false, model: {} })
            }

            createOrEditSuccess = (data?: any) => {
                this.closeEditModal()
                this.closeCreateModal()
                if (constants.filterModal || constants.paginate)
                    this.props.filter(constants.modelName, this.state.filterModel)
                else
                    this.fetchModel(constants.modelName)
            }

            resetFilter() {
                const baseFilterModal = {
                    paginate: {
                        currentPage: 1,
                        currentPageSize: this.getDefaultPageSize()
                    },
                    limit: this.getDefaultPageSize(),
                    skip: 0
                }
                this.setState({ filterModel: baseFilterModal })
                this.fetchModel(constants.modelName)
            }

            fetchModel(modelName: string) {
                modelName &&
                    this.getDefaultPageSize() 
                        ? this.props.filter(modelName, { limit: constants.paginate.defaultPageSize }, this.searchByQueryParams, undefined, this.props.queryParams) 
                        : this.props.fetch(modelName, this.searchByQueryParams, undefined, this.props.queryParams)
            }

            filterSuccess(data: any) {
                this.closeFilterModal()
            }

            getDisplayText = (value: any, field: any, index?: number): any => {
            }

            handleSearch = (e: any) => {
                this.setState({ searchQuery: e.target.value })
            }

            handleFieldSearch = (field: string, searchQuery: any) => {
                const filterModal = Object.assign({}, this.state.filterModel, { [field]: searchQuery })
                if (searchQuery === "") {
                    this.props.filter(constants.modelName, filterModal)
                }
                this.setState({ filterModel: filterModal })
            }

            fetchSearchResults = () => {
                const newFilterModel = Object.assign({}, this.state.filterModel,
                    { skip: 0, paginate: Object.assign({}, this.state.filterModel.paginate, { currentPage: 1 }) })
                this.setState({
                    filterModel: newFilterModel
                })
                this.props.filter(constants.modelName, newFilterModel)
            }

            inlineEdit(item: any, success: any, error: any) {
                this.props.createOrModify(constants.modelName, item, true, this.inlineEditSuccess.bind(this, success), this.inlineEditError.bind(this, error), this.props.queryParams)
            }

            inlineEditSuccess(success: any, data: any) {
                this.createOrEditSuccess(data)
                success(data)
            }

            inlineEditError(error: any, data: any) {
                error(data)
            }

            successCustomModalDispatch(data: any, type: string, model: string) {
                this.props.successCustomModal(data, type, model)
            }

            failureCustomModalDispatch(err: any, modelName: string, type: string) {
                this.props.failureCustomModal(err, modelName, type)
            }

            getCustomComponent() {
                const CustomComponent = constants.customModalComponent(this.state.model, this.closeCustomModal, this.successCustomModalDispatch, this.failureCustomModalDispatch)
                return <CustomComponent />
            }

            previousPage() {
                const filterModelData = Object.assign({}, this.state.filterModel)
                const paginationData = Object.assign({}, this.state.filterModel.paginate)
                paginationData['currentPage'] -= 1
                filterModelData['skip'] = (paginationData['currentPage'] - 1) * this.state.filterModel.limit +
                    (paginationData['currentPage'] - 1 === 0 ? 0 : 1)
                filterModelData['paginate'] = paginationData
                this.setState({
                    filterModel: filterModelData
                })
                this.props.filter(constants.modelName, filterModelData)
            }

            nextPage() {
                const filterModelData = Object.assign({}, this.state.filterModel)
                const paginationData = Object.assign({}, this.state.filterModel.paginate)
                paginationData['currentPage'] += 1
                filterModelData['skip'] = this.state.filterModel.paginate.currentPage * this.state.filterModel.limit + 1
                filterModelData['paginate'] = paginationData
                this.setState({
                    filterModel: filterModelData
                })
                this.props.filter(constants.modelName, filterModelData)
            }

            paginate(pageSize: number) {
                const filterModelData = Object.assign({}, this.state.filterModel)
                const paginationData = Object.assign({}, this.state.filterModel.paginate)
                paginationData['currentPageSize'] = pageSize
                paginationData['currentPage'] = 1
                filterModelData['paginate'] = paginationData
                filterModelData['skip'] = 0
                filterModelData['limit'] = pageSize
                this.setState({ filterModel: filterModelData })
                this.props.filter(constants.modelName, filterModelData)
            }

            getTableData() {
                return this.props[constants.modelName] && this.props[constants.modelName].results ? this.props[constants.modelName].results : this.props[constants.modelName]
            }

            render() {
                const rows = _.isEmpty(constants.orderby) ? this.getTableData() : _.sortBy(this.getTableData(), (doc: any) => {
                    return _.trim(doc[constants.orderby].toLowerCase())
                })
                let filteredRows = (!constants.enableSearch || _.isEmpty(this.state.searchQuery)) ? rows : _.filter(rows, (row: any) => JSON.stringify(row).toLowerCase().indexOf(this.state.searchQuery.toLowerCase()) !== -1)
                _.forEach(_.filter(constants.fields, (field) => field.search &&
                    field.search.filterLocation !== "server" &&
                    this.state.filterModel[field.search.key]), (field: any) => {
                        filteredRows = _.filter(filteredRows, (row: any) => !row[field.field] || JSON.stringify(row[field.field]).toLowerCase().indexOf(this.state.filterModel[field.search.key].toLowerCase()) !== -1)
                    })
                if (this.props[constants.modelName] && this.props[constants.modelName].error) {
                    return <div className="cf-main-content-container" style={{ width: "100%", padding: 10, overflowY: "scroll" }}>
                        <Alert bsStyle="danger">{"Error occured while fetching " + constants.title}</Alert>
                    </div>
                }
                return (
                    <div className="cf-main-content-container" style={{ width: "100%", padding: 10, overflowY: "scroll" }}>
                        {constants.createModal && <div className="pull-right btn btn-primary btn-xs"
                            onClick={this.showCreateModal}>{"+ New " + constants.creationTitle}</div>}
                        {constants.filterModal &&
                            <div style={{ marginRight: 10 }} className="pull-right btn btn-primary btn-xs"
                                onClick={this.showFilterModal}>{"Filter " + constants.creationTitle}</div>}
                        {constants.filterModal &&
                            <div style={{ marginRight: 10 }} className="pull-right btn btn-primary btn-xs"
                                onClick={this.resetFilter}>{"Reset Filter "}</div>}
                        <div className="heading cf-container-header">{constants.title}</div>
                        {constants.paginate && this.props[constants.modelName] && this.props[constants.modelName].metadata &&
                            <PaginationComponent
                                prev={this.previousPage}
                                next={this.nextPage}
                                paginate={this.paginate}
                                metadata={this.props[constants.modelName].metadata}
                                dataconstant={constants.paginate}
                                item={this.state.filterModel}
                            />}
                        {constants.enableSearch && <div>
                            <FormGroup style={{ paddingTop: "10px" }}>
                                <FormControl type="text" value={this.state.searchQuery} placeholder="Search" onChange={this.handleSearch} />
                            </FormGroup>
                        </div>}
                        <div style={{ marginTop: "10px" }} />

                        <Table className="table table-striped cftable" striped bordered condensed hover>
                            <thead>
                                <tr>
                                    {constants.fields.filter((field: any) => field.display).map((field: any, index: any) =>
                                        <th key={index}>{field.title}</th>)}
                                    {constants.editModal && <th></th>}
                                    {constants.customModal && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {constants.fields.some((field: any) => field.search) &&
                                    <tr key='searchRow'>
                                        {_.map(_.filter(constants.fields, (field: any) => field.display === true), (field: any, i: number) => (
                                            <td key={i} style={(field.cellCss) ? field.cellCss : { margin: "0px" }}>
                                                {field.search && field.search.filterLocation === "server" &&
                                                    <div style={{ display: "flex" }}>
                                                        <div style={{ display: "inline-block", width: "80%" }}>
                                                            <input type="text"
                                                                style={{ width: "100%" }}
                                                                value={(this.state.filterModel || {})[field.search.key]}
                                                                onChange={(e: any) => this.handleFieldSearch(field.search.key, e.target.value)}
                                                            />
                                                        </div>
                                                        <button style={{ marginLeft: "10px", color: "grey", height: 30 }}
                                                            className="glyphicon glyphicon-search"
                                                            aria-hidden="true"
                                                            onClick={this.fetchSearchResults} />
                                                    </div>}
                                            </td>
                                        ))}
                                        {constants.editModal && <td></td>}
                                        {constants.customModal && <td></td>}
                                    </tr>}
                                {_.map(filteredRows, (model: any, index: number) => {
                                    const filtered = constants.fields.filter((field: any) => field.display === true)
                                    return <tr key={index}>
                                        {_.map(filtered, (field: any, i: number) => {
                                            return <td key={i} style={(field.cellCss) ? field.cellCss : { margin: "0px" }}>
                                                <div style={{ marginTop: 8 }}>
                                                    <ListNestedComponent
                                                        field={field} model={model}
                                                        additionalModels={this.props.additionalModels}
                                                        modelChanged={this.inlineEdit} />
                                                </div>
                                            </td>
                                        })}
                                        {constants.editModal &&
                                            <td key={2}><span style={{ margin: 8, color: "grey", cursor: "pointer" }}
                                                className="glyphicon glyphicon-pencil fas fa-pencil-alt"
                                                aria-hidden="true" onClick={this.showEditModal(model)} />
                                            </td>}
                                        {constants.customModal &&
                                            <td key={2}><span style={{ margin: 8, color: "grey", cursor: "pointer" }}
                                                className="glyphicon glyphicon-duplicate"
                                                aria-hidden="true" onClick={this.showCustomModal.bind(this, model)} />
                                            </td>}
                                    </tr>
                                })}

                            </tbody>
                        </Table>
                        {constants.createModal && this.state.showCreateModal &&
                            <ModalComponent
                                constants={constants}
                                showModal={this.state.showCreateModal}
                                closeModal={this.closeCreateModal}
                                modalType={"CREATE"}
                                createOrModify={this.props.createOrModify}
                                createOrEditSuccess={this.createOrEditSuccess}
                                additionalModels={this.props.additionalModels}
                                queryParams={this.props.queryParams} />
                        }
                        {constants.editModal && this.state.showEditModal &&
                            <ModalComponent
                                constants={constants}
                                showModal={this.state.showEditModal}
                                closeModal={this.closeEditModal}
                                modalType={"EDIT"}
                                fetch={(model: string) => this.props.fetch(model)}
                                item={this.state.model}
                                createOrModify={this.props.createOrModify}
                                createOrEditSuccess={this.createOrEditSuccess}
                                deleteModel={this.props.deleteModel}
                                additionalModels={this.props.additionalModels}
                                queryParams={this.props.queryParams} />
                        }
                        {constants.filterModal && this.state.showFilterModal &&
                            <ModalComponent
                                constants={constants}
                                showModal={this.state.showFilterModal}
                                closeModal={this.closeFilterModal}
                                modalType={"FILTER"}
                                item={this.state.filterModel}
                                filterSuccess={this.filterSuccess}
                                filter={this.props.filter}
                                additionalModels={this.props.additionalModels}
                                queryParams={this.props.queryParams} />
                        }
                        {constants.customModal && this.state.showCustomModal &&
                            this.getCustomComponent()
                        }
                    </div>
                )
            }
        }

        return connect(mapStateToProps, mapDispatchToProps)(ListClass)
    }
}
