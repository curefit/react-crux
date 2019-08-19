import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import { AsyncTypeahead } from "react-bootstrap-typeahead"
import { isEmpty, find } from "lodash"
import { fetchDynamicTypeaheadResults } from "../Actions"

interface DynamicTypeAheadProps extends InlineComponentProps {
    options?: any
    type?: string
}

@autobind
export class DynamicTypeaheadComponent extends React.Component<DynamicTypeAheadProps, any> {

    constructor(props: any) {
        super(props)
        this.state = {
            isLoading: false,
            options: props.options || [],
            selected: props.currentModel || undefined
        }
    }

    componentDidMount() {
        if (isEmpty(this.state.options) && this.props.type !== "iterable") {
            const item: any = {
                limit: 10
            }
            if (!isEmpty(this.state.selected)) {
                if (this.props.field.foreign.keys) {
                    for (const key of this.props.field.foreign.keys) {
                        item[key] = this.state.selected[key]
                    }
                } else {
                    item[this.props.field.foreign.key] = this.state.selected
                }
            }
            fetchDynamicTypeaheadResults(this.props.field.foreign.modelName, item).then((data: any) => {
                this.setState({
                    isLoading: false,
                    options: data.results,
                })
            }).catch((error: any) => {
                console.log("Error while fetching " + this.props.field.foreign.modelName, error)
            })
        } else {
            this.setState({
                isLoading: false,
                options: this.props.options || []
            })
        }
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.options && isEmpty(this.state.options)) {
            this.setState({
                isLoading: false,
                options: nextProps.options
            })
        }
    }

    handleSearch = (query: string) => {
        this.setState({ isLoading: true })
        const item = {
            [this.props.field.foreign.title]: query, limit: 10
        }
        fetchDynamicTypeaheadResults(this.props.field.foreign.modelName, item).then((data: any) => {
            this.setState({
                isLoading: false,
                options: data.results,
            })
        }).catch((error: any) => {
            console.log("Error while fetching " + this.props.field.foreign.modelName, error)
        })
    }

    handleChange = (item: any) => {
        if (!isEmpty(item)) {
            this.setState({ selected: item[0].value })
            this.props.modelChanged(this.props.field, item[0].value)
        } else {
            this.setState({ selected: undefined })
        }
    }

    handleBlurChange = () => {
        if (isEmpty(this.state.selected) && !isEmpty(this.props.currentModel)) {
            this.props.modelChanged(this.props.field, "")
        }
    }

    getModalValue = (modelData: any) => {
        if (this.props.field.foreign.keys && Array.isArray(this.props.field.foreign.keys)) {
            const eventKey: any = {}
            for (const key of this.props.field.foreign.keys) {
                eventKey[key] = modelData[key]
            }
            return eventKey
        }
        return modelData[this.props.field.foreign.key]
    }

    getTitle = (modelData: any) => {
        return this.props.field.foreign.titleTransform ? this.props.field.foreign.titleTransform(modelData) : modelData[this.props.field.foreign.title]
    }

    render() {
        let selected = undefined
        let optionsData: any = []
        if (this.state.options.length) {
            optionsData = this.state.options.map((modelData: any) => {
                return { label: this.getTitle(modelData), value: this.getModalValue(modelData) }
            })
        }
        if (this.state.selected) {
            const selectedRecord = find(optionsData, (doc: any) => {
                if (this.props.field.foreign.keys) {
                    return this.props.field.foreign.keys.every((key: any) => doc.value[key] === this.props.currentModel[key])
                }
                return doc.value === this.props.currentModel
            })
            if (selectedRecord) {
                selected = [selectedRecord]
            } else {
                selected = [{ label: `${this.state.selected} - Bad Value`, value: this.state.selected }]
            }
        }
        return <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "inline-block", width: "300px" }}>
                {
                    this.props.showTitle && !isEmpty(this.props.field.title) && !(this.props.field.style && this.props.field.style.hideLabel) &&
                    <div><label style={{
                        fontSize: "10px",
                        marginRight: "10px"
                    }}>{this.props.field.title.toUpperCase()}</label><br /></div>
                }
                <AsyncTypeahead
                    id={`id-${this.props.field.title}`}
                    labelKey={"label"}
                    minLength={0}
                    isLoading={this.state.isLoading}
                    onSearch={this.handleSearch}
                    options={optionsData}
                    selected={selected || []}
                    onChange={this.handleChange}
                    onBlur={this.handleBlurChange}
                />
            </div>
        </div>
    }
}