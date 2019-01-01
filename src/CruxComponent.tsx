import * as React from "react"
import { connect } from "react-redux"
import { createOrModify, deleteModel, fetchModel, filterModel } from "./Actions"
import * as _ from "lodash"
import { getAdditionalModels, getAnchors } from "./util"
import autobind from "autobind-decorator"
import { Alert, FormControl, FormGroup, Table } from "react-bootstrap"
import { ModalComponent } from "./components/ModalComponent"
import { ListNestedComponent } from "./components/ListNestedComponent"

export type ModalType = "CREATE" | "EDIT" | "FILTER"
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
}

export class CruxComponentCreator {
    static create<M, P>(constants: any): any {
        let anchors: any = {}

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
        class ListClass extends React.Component<any, any> {

            componentDidMount() {
                this.fetchModels()
                anchors = getAnchors(constants)
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
                                style={{ width: "100%", padding: 10 }}>
                        <Alert bsStyle="danger">{"Error occured while fetching " + constants.title}</Alert>
                    </div>
                }
                return (

                    <div className="cf-main-content-container" style={{ width: "100%", padding: 10 }}>
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
                                                        <div style={{ marginTop: 8 }}>
                                                            <ListNestedComponent
                                                                field={field} model={model}
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
                            constants={constants}
                            showModal={this.state.showCreateModal}
                            closeModal={this.closeCreateModal}
                            modalType={"CREATE"}
                            createOrModify={this.props.createOrModify}
                            createOrEditSuccess={this.createOrEditSuccess}
                            additionalModels={this.props.additionalModels} />
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
                            additionalModels={this.props.additionalModels} />
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
                            additionalModels={this.props.additionalModels} />
                        }
                    </div>
                )
            }
        }

        return connect(mapStateToProps, mapDispatchToProps)(ListClass)
    }
}
