import autobind from "autobind-decorator"
import * as React from "react"
import { isEmpty, sortBy, trim, find, map, isNil, isObject } from "lodash"
import { DropdownButton, MenuItem } from "react-bootstrap"
import { InlineComponentProps } from "../CruxComponent"
import { TitleComponent } from "./TitleComponent"
@autobind
export class SelectComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            isValueChanged: false, previousValue
                : this.props.currentModel
        }
    }
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
            optionsData = isEmpty(this.props.field.foreign.orderby)
                ? this.props.additionalModels[this.props.field.foreign.modelName]
                : sortBy(this.props.additionalModels[this.props.field.foreign.modelName], (doc: any) => trim(doc[this.props.field.foreign.orderby].toLowerCase()))
        }
        let foreignTitle = !hideLabel ? "Choose " + this.props.field.title : "Choose"
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
            if (!isNil(this.props.currentModel) && !(isObject(this.props.currentModel) && isEmpty(this.props.currentModel))) {
                const foreignDoc = find(optionsData, (doc: any) => {
                    if (this.props.field.foreign.keys) {
                        return this.props.field.foreign.keys.every((key: any) => doc[key] === this.props.currentModel[key])
                    }
                    if (this.props.field.valueType === "object") {
                        return doc.id === this.props.currentModel.id
                    }
                    if (this.props.field.foreign.key) {
                        return doc[this.props.field.foreign.key] === this.props.currentModel
                    }
                    console.error(`Did you forget to add a "key(s)" field in foreign . Possible culprit: ${this.props.field}`)
                })
                if (isEmpty(foreignDoc)) {
                    foreignTitle = this.props.currentModel + " Bad Value"
                } else if (this.props.field.foreign.titleTransform && typeof this.props.field.foreign.titleTransform === "function") {
                    foreignTitle = this.props.field.foreign.titleTransform(foreignDoc)
                } else {
                    foreignTitle = foreignDoc[this.props.field.foreign.title]
                }
            }
        } else {
            console.error("Did you forget to add a \"foreign\" field with a type: \"select\". Possible culprit: ", this.props.field)
        }
        return <div>
            {
                this.props.showTitle && !isEmpty(this.props.field.title) && !hideLabel &&
                <div>
                    <TitleComponent modalType={this.props.modalType} field={this.props.field} isValueChanged={this.state.isValueChanged} /><br /></div>
            }
            <DropdownButton bsSize="small" style={{ width: "auto" }} id={this.props.field.field + "_dropdown"}
                title={foreignTitle}
                disabled={this.props.readonly}>
                <MenuItem onSelect={() => this.select(this.props.field, undefined)}>
                    -Select-
                </MenuItem>
                {
                    map(optionsData, ((doc: any, index: any) => {
                        let eventKey = doc
                        if (this.props.field.valueType === "object") {
                            eventKey = doc
                        } else if (this.props.field.foreign.keys) {
                            eventKey = {}
                            for (const key of this.props.field.foreign.keys) {
                                eventKey[key] = doc[key]
                            }
                        } else if (this.props.field.foreign.key) {
                            eventKey = doc[this.props.field.foreign.key]
                        } else {
                            console.error(`Did you forget to add a "key(s)" field in foreign . Possible culprit: ${this.props.field}`)
                        }
                        return <MenuItem onSelect={(eventKey: any) => {

                            this.select(this.props.field, eventKey)
                        }} key={index} eventKey={eventKey}>
                            {this.props.field.foreign.titleTransform ? this.props.field.foreign.titleTransform(doc) : doc[this.props.field.foreign.title]}
                        </MenuItem>
                    }))
                }
            </DropdownButton></div>
    }

    select = (field: any, eventKey: any) => {
        if (eventKey === this.state.previousValue) {
            this.setState({
                isValueChanged: false
            })
        } else {
            this.setState({
                isValueChanged: true
            })
        }

        this.props.modelChanged(field, eventKey)
    }
}

