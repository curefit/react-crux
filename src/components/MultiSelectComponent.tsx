import autobind from "autobind-decorator"
import * as React from "react"
import { isEmpty, sortBy, map, find, trim } from "lodash"
import { InlineComponentProps } from "../CruxComponent"
import Select, { components } from "react-select"
import { TitleComponent } from "./TitleComponent"
const MultiValueLabel = (props: any) => {
    return (
        <components.MultiValueLabel {...props} innerProps={Object.assign({}, props.innerProps, { title: props.data.label })} />
    )
}

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
            optionsData = isEmpty(this.props.field.foreign.orderby)
                ? this.props.additionalModels[this.props.field.foreign.modelName]
                : sortBy(this.props.additionalModels[this.props.field.foreign.modelName], (doc: any) => trim(doc[this.props.field.foreign.orderby].toLowerCase()))
        }

        optionsData = optionsData.map((modelData: any) => {
            return { label: this.getTitle(modelData), value: this.getModalValue(modelData) }
        })

        const placeholderText = !hideLabel ? "Choose " + this.props.field.title : "Choose"
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
        return <div style={this.props.field.style || { width: "300px" }}>
            {
                this.props.showTitle && !isEmpty(this.props.field.title) && !hideLabel &&
                <div>
                    <TitleComponent field={this.props.field} />
                    <br /></div>
            }
            <Select isMulti={this.props.isMulti}
                isClearable={this.props.field.multiClear || false}
                isSearchable={true}
                components={{ MultiValueLabel }}
                closeMenuOnSelect={!this.props.isMulti}
                onChange={(eventKey: any) => this.select(this.props.field, eventKey)}
                value={multiSelectValue}
                options={optionsData}
                isDisabled={this.props.readonly}
                placeholder={placeholderText}
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
        if (eventKey && this.props.isMulti) {
            let fieldList = []
            fieldList = eventKey.map((event: any) => event.value)
            this.props.modelChanged(field, fieldList)
        } else if (this.props.isMulti) {
            this.props.modelChanged(field, [])
        } else {
            this.props.modelChanged(field, eventKey.value)
        }
    }
}
