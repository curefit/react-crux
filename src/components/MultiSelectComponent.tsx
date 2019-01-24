import autobind from "autobind-decorator"
import * as React from "react"
import * as _ from "lodash"
import { DropdownButton, MenuItem } from "react-bootstrap"
import { InlineComponentProps } from "../CruxComponent"
import Select from "react-select"

@autobind
export class MultiSelectComponent extends React.Component<InlineComponentProps, any> {
    render() {
        const hideLabel = this.props.field.style && this.props.field.style.hideLabel
        if (!this.props.field.title && !hideLabel) {
            console.error("Did you forget to add a \"title\" in the select field. Possible culprit: ", this.props.field)
        }
        let optionsData: any = []
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

        optionsData = optionsData.map((modelData: any) => {
            return { label: modelData.title, value: modelData[this.props.field.foreign.key] }
        })

        const placeholderText = !hideLabel ? "Choose " + this.props.field.title : "Choose"
        let foreignTitle: any = []
        let multiSelectValue: any = []
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
            if (!_.isEmpty(this.props.currentModel) && Array.isArray(this.props.currentModel)) {
                multiSelectValue = _.map(this.props.currentModel, (value: string) => {
                    const foreignDoc = _.find(optionsData, (doc: any) => {
                        return doc["value"] === value
                    })
                    if (_.isEmpty(foreignDoc)) {
                        foreignTitle = { label: value + " Bad Value", value }
                    } else {
                        foreignTitle = foreignDoc
                    }
                    return foreignTitle
                })
            }
        } else {
            console.error("Did you forget to add a \"foreign\" field with a type: \"select\". Possible culprit: ", this.props.field)
        }
        return <div style={{ width: "300px" }}>
            {
                this.props.showTitle && !_.isEmpty(this.props.field.title) && !hideLabel &&
                <div><label style={{
                    fontSize: "10px",
                    marginRight: "10px"
                }}>{this.props.field.title.toUpperCase()}</label><br /></div>
            }
            <Select isMulti={true}
                isClearable={true}
                isSearchable={true}
                closeMenuOnSelect={false}
                onChange={(eventKey: any) => this.select(this.props.field, eventKey)}
                value={multiSelectValue}
                options={optionsData}
                placeholder={placeholderText}
            />
        </div>
    }

    select = (field: any, eventKey: any) => {
        let fieldList = []
        if (eventKey) {
            fieldList = eventKey.map((event: any) => event.value)
        }
        this.props.modelChanged(field, fieldList)
    }
}
