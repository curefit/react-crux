import autobind from "autobind-decorator"
import * as React from "react"
import { isEmpty, map, find, uniq, concat } from "lodash"
import { InlineComponentProps } from "../CruxComponent"
import { components } from "react-select"
import AsyncSelect from "react-select/async"
import { fetchDynamicTypeaheadResults } from "../Actions"

const MultiValueLabel = (props: any) => {
    return (
        <components.MultiValueLabel {...props} innerProps={Object.assign({}, props.innerProps, { title : props.data.label})} />
    )
}

@autobind
export class DynamicMultiSelectComponent extends React.Component<InlineComponentProps, any> {

    constructor(props: any) {
        super(props)
        this.state = {
            isLoading: false,
            options: props.options || [],
            selected: props.currentModel || undefined
        }
    }

    componentDidMount() {
        if (isEmpty(this.state.options)) {
            const item: any = {}
            if (!isEmpty(this.state.selected)) {
                item[this.props.field.foreign.bulkKey] = this.state.selected
            } else {
                item["limit"] = 10
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

    handleSearch = (query: string, callback: Function) => {
        this.setState({ isLoading: true })
        const item = {
            [this.props.field.foreign.title]: query, limit: 10
        }
        fetchDynamicTypeaheadResults(this.props.field.foreign.modelName, item).then((data: any) => {
            const newOptions = uniq(concat(data.results, this.state.options))
            this.setState({
                isLoading: false,
                options: newOptions,
            })
            callback(this.loadOptionsData(newOptions))
        }).catch((error: any) => {
            console.log("Error while fetching " + this.props.field.foreign.modelName, error)
        })
    }

    loadOptionsData(options: any[]) {
        let optionsData: any = []
        if (options.length) {
            optionsData = this.state.options.map((modelData: any) => {
                return { label: this.getTitle(modelData), value: this.getModalValue(modelData) }
            })
        }
        return optionsData
    }

    loadSelectedValue(optionsData: any[]) {
        let multiSelectValue: any
        if (this.props.field.foreign) {
            if (!this.props.field.foreign.key && !this.props.field.foreign.keys) {
                console.error(`Did you forget to add a "key(s)" field in foreign. Possible culprit: ${this.props.field}`)
            }
            if (this.props.field.foreign.key && this.props.field.foreign.keys) {
                console.error(`ambiguous use of "key" and "keys", use any one`)
            }
            if (!this.props.field.foreign.title) {
                console.error(`Did you forget to add a "title" field in foreign . Possible culprit: ${this.props.field}`)
            }
            if (!isEmpty(this.props.currentModel)) {
                let foreignTitle: any
                if (this.props.isMulti && Array.isArray(this.props.currentModel)) {
                    multiSelectValue = map(this.props.currentModel, (value: string) => {
                        const foreignDoc = find(optionsData, (doc: any) => {
                            return doc["value"] == value
                        })
                        if (isEmpty(foreignDoc)) {
                            foreignTitle = { label: value + " Bad Value", value }
                        } else {
                            foreignTitle = foreignDoc
                        }
                        return foreignTitle
                    })
                } else {
                    const foreignDoc = find(optionsData, (doc: any) => {
                        if (this.props.field.foreign.keys) {
                            return this.props.field.foreign.keys.every((key: any) => doc.value[key] == this.props.currentModel[key])
                        }
                        return doc.value == this.props.currentModel
                    })
                    if (isEmpty(foreignDoc)) {
                        foreignTitle = { label: this.props.currentModel + " Bad Value", value: this.props.currentModel }
                    } else {
                        foreignTitle = foreignDoc
                    }
                    multiSelectValue = foreignTitle
                }
            }
        } else {
            console.error("Did you forget to add a \"foreign\" field with a type: \"select\". Possible culprit: ", this.props.field)
        }
        return multiSelectValue
    }


    render() {
        const hideLabel = this.props.field.style && this.props.field.style.hideLabel
        if (!this.props.field.title && !hideLabel) {
            console.error("Did you forget to add a \"title\" in the select field. Possible culprit: ", this.props.field)
        }

        const optionsData: any[] = this.loadOptionsData(this.state.options)

        const placeholderText = !hideLabel ? "Choose " + this.props.field.title : "Choose"
        const multiSelectValue: any = this.loadSelectedValue(optionsData)

        return <div style={{ width: "300px" }}>
            {
                this.props.showTitle && !isEmpty(this.props.field.title) && !hideLabel &&
                <div><label style={{
                    fontSize: "10px",
                    marginRight: "10px"
                }}>{this.props.field.title.toUpperCase()}</label><br /></div>
            }
            <AsyncSelect isMulti={true}
                isClearable={this.props.field.multiClear || false}
                isSearchable={true}
                components={{ MultiValueLabel }}
                closeMenuOnSelect={!this.props.isMulti}
                onChange={(eventKey: any) => this.select(this.props.field, eventKey)}
                value={multiSelectValue}
                isDisabled={this.props.readonly}
                placeholder={placeholderText}
                loadOptions={this.handleSearch}
                defaultOptions={optionsData}
                cacheOptions
            />
        </div>
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

    select = (field: any, eventKey: any) => {
        if (eventKey) {
            let fieldList = []
            fieldList = eventKey.map((event: any) => event.value)
            this.props.modelChanged(field, fieldList)
        } else {
            this.props.modelChanged(field, [])
        }
    }
}
