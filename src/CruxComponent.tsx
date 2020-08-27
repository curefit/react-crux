import * as React from "react"
import { connect } from "react-redux"
import {
    createOrModify, deleteModel, fetchModel, filterModel, successCustomModal, failureCustomModal,
    searchModel, bulkCreate, openModal, putData
} from "./Actions"
import { reduce, map, filter, isEmpty, isEqual, sortBy, forEach, trim } from "lodash"
import { getAdditionalModels, getAnchors } from "./util"
import autobind from "autobind-decorator"
import { Alert, FormControl, FormGroup, Table } from "react-bootstrap"
import { ModalComponent } from "./components/ModalComponent"
import { ListNestedComponent } from "./components/ListNestedComponent"
import { PaginationComponent } from "./components/PaginationComponent"
import { BulkCreateModal } from "./components/BulkCreatorModal"

export type ModalType = "CREATE" | "EDIT" | "FILTER" | "CUSTOM" | "BULK_CREATE"
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
    readonly?: boolean,
    isMulti?: boolean,
    index?: number
    style?: any
    iterableNested?: boolean
    nestedIterableModelChanged?: any
    additionalProps?: any
}

export { ModalComponent } from "./components/ModalComponent"
export { NestedEditComponent } from "./components/NestedEditComponent"

export class CruxComponentCreator {
    static create<M, P>(constants: any): any {
        let anchors: any = {}

        function mapStateToProps(state: any, ownProps: any): any {
            const additionalModels = getAdditionalModels(constants)
            const stateRoot = !constants.stateRoot ? "crux" : (constants.stateRoot === "none" ? undefined : constants.stateRoot)
            const additionalModelValues = map(additionalModels, (model: any) => {
                return { "modelName": model, "value": stateRoot ? state[stateRoot][model] : state[model] }
            })
            return Object.assign({}, {
                modalData: state.crux.modalData,
                [constants.modelName]: stateRoot ? state[stateRoot][constants.modelName] : state[constants.modelName],
                additionalModels: reduce(additionalModelValues, (sum: any, obj: any) => {
                    return Object.assign({}, sum, { [obj.modelName]: obj.value })
                }, {}),

                queryParams: ownProps && ownProps.options && ownProps.options.queryParams,
                additionalProps: ownProps && ownProps.options && ownProps.options.additionalProps
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
                putData: (data: any, model: string) => {
                    dispatch(putData(data, model))
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
                },
                bulkCreate: (model: string, csvUrl: string, success: any, error: any) => {
                    dispatch(bulkCreate(model, csvUrl, success, error))
                }
            }
        }

        @autobind
        class ListClass extends React.Component<any, any> {
            constructor(props: any) {
                super(props)
                const showCreateModal = []
                if (props.modalData) {
                    for (const property in props.modalData) {
                        showCreateModal.push(...props.modalData[property])
                    }
                }
                const editArray = showCreateModal.filter((modal) => modal.type === "EDIT")
                const createArray = showCreateModal.filter((modal) => modal.type === "CREATE")
                this.state = {
                    showCreateModal: createArray.length ? true : false,
                    showEditModal: editArray.length ? true : false,
                    showCreateModalArray: showCreateModal,
                    showModalComponent: false,
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
                    },
                    openCreateModal: false,
                    showBulkCreateModal: false
                }
            }

            componentDidMount() {
                this.fetchModels(this.props)
                anchors = getAnchors(constants)
            }

            fetchModels = (props: any) => {
                const additionalModels = filter(getAdditionalModels(constants), (model: string) => this.checkAdditionalModel(model, props))
                additionalModels && additionalModels.forEach((model: string) => this.fetchServerData(model, props))
            }

            checkAdditionalModel(modelName: string, props: any) {
                if ((modelName === constants.modelName
                    && (constants.paginate || this.props.queryParams) ||
                    !Array.isArray(props.additionalModels[modelName]))) {
                    return true
                }
                return isEmpty(props.additionalModels[modelName])
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
                if (this.props.location && this.props.location.search) {
                    const params = new URLSearchParams(this.props.location.search)
                    const searchId = params.get("id")
                    const searchField = params.get("field")
                    const mode = params.get("mode")
                    if (searchId && searchField) {
                        const searchData = data.filter((x: any) => x[searchField] === searchId)
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
                    } else if (mode === "CREATE") {
                        this.showCreateModal()
                    }
                }
            }





            getDefaultPageSize = () => {
                return constants.paginate && constants.paginate.defaultPageSize || ""
            }

            componentWillReceiveProps(nextProps: any) {
                if (!isEqual(this.props.queryParams, nextProps.queryParams)) {
                    this.fetchModels(nextProps)
                }
            }

            showCreateModal = () => {
                const { showCreateModalArray } = this.state
                showCreateModalArray.push({
                    constants: constants,
                    model: {},
                    additionalModels: this.props.additionalModels,
                    type: "CREATE"
                })
                this.setState({ showCreateModal: true, showModalComponent: true, showCreateModalArray })
                openModal('ModalName', showCreateModalArray)
            }


            closeCreateModal = (index: number, constantsModal: any) => {
                const { showCreateModalArray } = this.state
                showCreateModalArray.splice(index, 1)
                let modelArray = showCreateModalArray.filter((arr: any) => arr.constants.modelName === constantsModal.modelName)
                this.props.putData(modelArray, constantsModal.modelName)
                this.setState({ showCreateModalArray })
            }

            closeEditModal = (index: number, constantsModal: any) => {
                const { showCreateModalArray } = this.state
                showCreateModalArray.splice(index, 1)
                let modelArray = showCreateModalArray.filter((arr: any) => arr.constants.modelName === constantsModal.modelName)
                this.props.putData(modelArray, constantsModal.modelName)
                this.setState({ showCreateModalArray })

            }

            showBulkCreateModal = () => {
                this.setState({ showBulkCreateModal: true })
            }

            closeBulkCreateModal = () => {
                this.setState({ showBulkCreateModal: false })
            }

            showFilterModal() {
                this.setState({ showFilterModal: true })
            }

            closeFilterModal() {
                this.setState({ showFilterModal: false })
            }

            showEditModal = (model: M) => {
                this.setState({ showEditModal: true, model })
                const { showCreateModalArray } = this.state
                showCreateModalArray.push({
                    constants: constants,
                    model: model,
                    additionalModels: this.props.additionalModels,
                    type: "EDIT"
                })
                this.setState({ showModalComponent: true, showCreateModalArray })
                openModal('ModalName', showCreateModalArray)
            }

            showCustomModal = (model: any) => {
                this.setState({ showCustomModal: true, model })
            }

            closeCustomModal = () => {
                this.setState({ showCustomModal: false, model: {} })
            }

          

            createOrEditSuccess = (data?: any, index?: any, constantsModal?: any) => {
                const constNew = constantsModal ? constantsModal : constants
                this.closeEditModal(index, constNew)
                // this.closeCreateModal(index, constNew)
                this.closeBulkCreateModal()
                if (constNew.filterModal || constNew.paginate)
                    this.props.filter(constNew.modelName, this.state.filterModel, undefined, undefined, this.props.queryParams)
                else
                    this.fetchModel(constNew.modelName)
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
                    this.props.filter(constants.modelName, filterModal, undefined, undefined, this.props.queryParams)
                }
                this.setState({ filterModel: filterModal })
            }

            handleSearchKeyPress = (event: any) => {
                if (event.charCode === 13) {
                    this.fetchSearchResults()
                }
            }

            fetchSearchResults = () => {
                const newFilterModel = Object.assign({}, this.state.filterModel,
                    { skip: 0, paginate: Object.assign({}, this.state.filterModel.paginate, { currentPage: 1 }) })
                this.setState({
                    filterModel: newFilterModel
                })
                this.props.filter(constants.modelName, newFilterModel, undefined, undefined, this.props.queryParams)
            }

            inlineEdit(item: any, success: any, error: any) {
                this.props.createOrModify(constants.modelName, item, true, this.inlineEditSuccess.bind(this, success), this.inlineEditError.bind(this, error), this.props.queryParams)
            }

            inlineEditSuccess(success: any, data: any) {
                this.createOrEditSuccess(data)
                success && success(data)
            }

            inlineEditError(error: any, data: any) {
                error && error(data)
            }

            successCustomModalDispatch(data: any, type: string, model: string) {
                this.props.successCustomModal(data, type, model)
            }

            failureCustomModalDispatch(err: any, modelName: string, type: string) {
                this.props.failureCustomModal(err, modelName, type)
            }

            getCustomComponent() {
                const CustomComponent = constants.customModalComponent
                return <CustomComponent
                    model={this.state.model}
                    closeModal={this.closeCustomModal}
                    sucessDispatch={this.successCustomModalDispatch}
                    failureDispatch={this.failureCustomModalDispatch}
                    additionalProps={this.props.additionalProps}
                    {...this.props} />
            }

            previousPage() {
                const filterModelData = Object.assign({}, this.state.filterModel)
                const paginationData = Object.assign({}, this.state.filterModel.paginate)
                paginationData["currentPage"] -= 1
                filterModelData["skip"] = (paginationData["currentPage"] - 1) * this.state.filterModel.limit +
                    (paginationData["currentPage"] - 1 === 0 ? 0 : 1)
                filterModelData["paginate"] = paginationData
                this.setState({
                    filterModel: filterModelData
                })
                this.props.filter(constants.modelName, filterModelData, undefined, undefined, this.props.queryParams)
            }

            nextPage() {
                const filterModelData = Object.assign({}, this.state.filterModel)
                const paginationData = Object.assign({}, this.state.filterModel.paginate)
                paginationData["currentPage"] += 1
                filterModelData["skip"] = this.state.filterModel.paginate.currentPage * this.state.filterModel.limit + 1
                filterModelData["paginate"] = paginationData
                this.setState({
                    filterModel: filterModelData
                })
                this.props.filter(constants.modelName, filterModelData, undefined, undefined, this.props.queryParams)
            }

            paginate(pageSize: number) {
                const filterModelData = Object.assign({}, this.state.filterModel)
                const paginationData = Object.assign({}, this.state.filterModel.paginate)
                paginationData["currentPageSize"] = pageSize
                paginationData["currentPage"] = 1
                filterModelData["paginate"] = paginationData
                filterModelData["skip"] = 0
                filterModelData["limit"] = pageSize
                this.setState({ filterModel: filterModelData })
                this.props.filter(constants.modelName, filterModelData, undefined, undefined, this.props.queryParams)
            }

            getTableData() {
                return this.props[constants.modelName] && this.props[constants.modelName].results ? this.props[constants.modelName].results : this.props[constants.modelName]
            }

            render() {
                const rows = isEmpty(constants.orderby) ? this.getTableData() : sortBy(this.getTableData(), (doc: any) => {
                    return trim(doc[constants.orderby].toLowerCase())
                })
                let filteredRows = (!constants.enableSearch || isEmpty(this.state.searchQuery)) ? rows : filter(rows, (row: any) => JSON.stringify(row).toLowerCase().indexOf(this.state.searchQuery.toLowerCase()) !== -1)
                forEach(filter(constants.fields, (field) => field.search &&
                    field.search.filterLocation !== "server" &&
                    this.state.filterModel[field.search.key]), (field: any) => {
                        filteredRows = filter(filteredRows, (row: any) => !row[field.field] || JSON.stringify(row[field.field]).toLowerCase().indexOf(this.state.filterModel[field.search.key].toLowerCase()) !== -1)
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

                        {constants.bulkCreateModal && <div className="pull-right btn btn-primary btn-xs"
                            onClick={this.showBulkCreateModal}>{"+ Bulk Create"}</div>}
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

                        <Table className="table table-striped cftable" striped bordered condensed hover responsive>
                            <thead>
                                <tr key="header">
                                    {constants.fields.filter((field: any) => field.display).map((field: any, index: any) =>
                                        <th key={field + index}>{field.title}</th>)}
                                    {constants.editModal && <th></th>}
                                    {constants.customModal && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {constants.fields.some((field: any) => field.search) &&
                                    <tr key="searchRow">
                                        {map(filter(constants.fields, (field: any) => field.display === true), (field: any, i: number) => (
                                            <td key={"search" + field.field + i} style={(field.cellCss) ? field.cellCss : { margin: "0px" }}>
                                                {field.search && field.search.filterLocation === "server" &&
                                                    <div style={{ display: "flex" }}>
                                                        <div style={{ display: "inline-block", width: "80%" }}>
                                                            <input type="text"
                                                                style={{ width: "100%" }}
                                                                value={this.state.filterModel && this.state.filterModel[field.search.key] || ""}
                                                                onKeyPress={this.handleSearchKeyPress}
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
                                {map(filteredRows, (model: any, index: number) => {
                                    const filtered = constants.fields.filter((field: any) => field.display === true)
                                    const rowKey = model._id || ""
                                    return <tr key={rowKey + index}>
                                        {map(filtered, (field: any, i: number) => {
                                            return <td key={rowKey + field.field + i} style={(field.cellCss) ? field.cellCss : { margin: "0px" }}>
                                                <div style={{ marginTop: 8 }}>
                                                    <ListNestedComponent
                                                        field={field} model={model}
                                                        additionalModels={this.props.additionalModels}
                                                        modelChanged={this.inlineEdit}
                                                        additionalProps={this.props.additionalProps}
                                                    />
                                                </div>
                                            </td>
                                        })}
                                        {constants.editModal &&
                                            <td key={rowKey + "edit"}><span style={{ margin: 8, color: "grey", cursor: "pointer" }}
                                                className="glyphicon glyphicon-pencil fas fa-pencil-alt"
                                                aria-hidden="true" onClick={() => this.showEditModal(model)} />
                                            </td>}
                                        {constants.customModal &&
                                            <td key={rowKey + "custom"}><span style={{ margin: 8, color: "grey", cursor: "pointer" }}
                                                className={constants.customModalIcon || "glyphicon glyphicon-duplicate"}
                                                aria-hidden="true" onClick={() => this.showCustomModal(model)} />
                                            </td>}
                                    </tr>
                                })}

                            </tbody>
                        </Table>
                        <div style={{
                            position: 'fixed',
                            bottom: 0
                        }}>
                            {constants.createModal && this.state.showCreateModal &&
                                this.state.showCreateModalArray.map((item: any, index: number) => (
                                    item.type === "CREATE" ? <ModalComponent
                                        constants={item.constants}
                                        setValueInArray={(index: any, value: any) => {
                                            let { showCreateModalArray } = this.state
                                            showCreateModalArray[index] = {
                                                model: value,
                                                constants: item.constants,
                                                additionalModels: item.additionalModels,
                                                type: "CREATE"
                                            }
                                            let modelArray = showCreateModalArray.filter((arr: any) => arr.constants.modelName === item.constants.modelName)
                                            this.props.putData(modelArray, item.constants.modelName)
                                            this.setState({
                                                showCreateModalArray
                                            })
                                        }}
                                        showModal={this.state.showCreateModal}
                                        showMinimize={true}
                                        showModalComponent={this.state.showModalComponent}
                                        closeModal={(modalIndex: number) => this.closeCreateModal(modalIndex, item.constants)}
                                        modalIndex={index}
                                        item={item.model}
                                        modalType={"CREATE"}
                                        createOrModify={this.props.createOrModify}
                                        createOrEditSuccess={(index: any, data: any) => this.createOrEditSuccess(data, index, item.constants)}
                                        additionalModels={item.additionalModels}
                                        queryParams={this.props.queryParams}
                                        additionalProps={this.props.additionalProps}
                                    /> : null
                                ))

                            }

                            {constants.bulkCreateModal && this.state.showBulkCreateModal &&
                                <BulkCreateModal
                                    constants={constants}
                                    showModal={this.state.showBulkCreateModal}
                                    closeModal={this.closeBulkCreateModal}
                                    createOrModify={this.props.bulkCreate}
                                    createOrEditSuccess={this.createOrEditSuccess}
                                    additionalProps={this.props.additionalProps}
                                />
                            }
                            {constants.editModal && this.state.showEditModal &&
                                this.state.showCreateModalArray.map((item: any, index: number) => (
                                    item.type === "EDIT" ? <ModalComponent
                                        constants={item.constants}
                                        showModal={this.state.showEditModal}
                                        closeModal={() => this.closeEditModal(index, item.constants)}
                                        modalType={"EDIT"}
                                        showMinimize={true}
                                        showModalComponent={this.state.showModalComponent}
                                        setValueInArray={(index: any, value: any) => {
                                            let { showCreateModalArray } = this.state
                                            showCreateModalArray[index] = {
                                                model: value,
                                                constants: item.constants,
                                                additionalModels: item.additionalModels,
                                                type: "EDIT",
                                            }
                                            let modelArray = showCreateModalArray.filter((arr: any) => arr.constants.modelName === item.constants.modelName)
                                            this.props.putData(modelArray, item.constants.modelName)
                                            this.setState({
                                                showCreateModalArray
                                            })
                                        }}
                                        fetch={(model: string) => this.props.fetch(model)}
                                        item={item.model}
                                        modalIndex={index}
                                        createOrModify={this.props.createOrModify}
                                        createOrEditSuccess={(index: any, data: any) => this.createOrEditSuccess(data, index, item.constants)}
                                        deleteModel={constants.deleteModal === false ? undefined : this.props.deleteModel}
                                        additionalModels={item.additionalModels}
                                        queryParams={this.props.queryParams}
                                        additionalProps={this.props.additionalProps}
                                    /> : null

                                ))

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
                                    queryParams={this.props.queryParams}
                                    additionalProps={this.props.additionalProps}
                                />
                            }
                            {constants.customModal && this.state.showCustomModal &&
                                this.getCustomComponent()
                            }
                        </div>

                    </div>
                )
            }
        }

        return connect(mapStateToProps, mapDispatchToProps)(ListClass)
    }
}


