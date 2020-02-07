import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import { AsyncTypeahead } from "react-bootstrap-typeahead"
import { isEmpty, find, isEqual } from "lodash"
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
                limit: 10, ...this.getDynamicPaylaod(),
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
                    options: data.results
                })
            }).catch((error: any) => {
                console.log("Error while fetching " + this.props.field.foreign.modelName, error)
            })
        }
    }

    componentWillReceiveProps(nextProps: any) {
        if (!isEmpty(nextProps.options) && isEmpty(this.state.options)) {
            this.setState({
                isLoading: false,
                options: nextProps.options
            })
        }
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        if (this.props.currentModel !== nextProps.currentModel ||
            !isEqual(this.state.options, nextState.options)) {
            return true
        }
        return false
    }

    getDynamicPaylaod = () => {
        let dynamicPayload = {}
        if (this.props.field.foreign.dynamicPayloadFn && typeof this.props.field.foreign.dynamicPayloadFn === "function") {
            dynamicPayload = this.props.field.foreign.dynamicPayloadFn({parentModel: this.props.parentModel})
        }
        return dynamicPayload
    }

    handleSearch = (query: string) => {
        this.setState({ isLoading: true })
        const item = {
            [this.props.field.foreign.title]: query, limit: 10, ...this.getDynamicPaylaod(),
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
            const value = item[0].value
            this.setState({ selected: value })
            if (this.props.type === "iterable") {
                const currentOption = this.state.options.find((option: any) => value === this.getModalValue(option))
                this.props.modelChanged(this.props.field, value, currentOption)
            } else {
                this.props.modelChanged(this.props.field, value)
            }
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
            selected = selectedRecord ? [selectedRecord] : [{ label: `${this.state.selected} - Bad Value`, value: this.state.selected }]
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
                    disabled={this.props.readonly}
                />
            </div>
        </div>
    }
}