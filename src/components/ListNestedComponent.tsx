import autobind from "autobind-decorator"
import * as React from "react"
import { includes, isEmpty, filter, map } from "lodash"
import { ListIterableComponent } from "./ListIterableComponent"
import { ListDateComponent } from "./ListDateComponent"
import { ListCheckboxComponent } from "./ListCheckboxComponent"
import { ListForeignComponent } from "./ListForeignComponent"
import { InlineEditComponent } from "./InlineEditComponent"
import { ListMultiSelectComponent } from "./ListMultiSelectComponent"
import { ListDateTimezoneComponent } from "./ListDateTimezoneComponent"

@autobind
export class ListNestedComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = {}
    }

    modelChanged = (data: any, success: any, error: any) => {
        const newModel = Object.assign({}, this.props.model, { [this.props.field.field]: data })
        this.props.modelChanged(newModel, success, error)
    }

    render(): any {
        if (this.props.field.conditionalField) {
            if (Array.isArray(this.props.field.conditionalValue)) {
                if (!includes(this.props.field.conditionalValue, this.props.model[this.props.field.conditionalField])) {
                    return <div />
                }
            } else if (this.props.field.conditionalValue !== this.props.model[this.props.field.conditionalField]) {
                return <div />
            }
        }

        if (this.props.field.type === "custom") {
            if (this.props.field.customComponent) {
                const CustomComponent = this.props.field.customComponent(this.props.model, this.props.additionalModels, this.props.parentModel, this.modelChanged)
                return <CustomComponent />
            } else {
                const CustomComponent = this.props.field.customViewComponent
                return <CustomComponent
                    currentModel={this.props.model}
                    additionalModels={this.props.additionalModels}
                    parentModel={this.props.parentModel}
                    additionalProps={this.props.additionalProps}
                    modelChanged={this.modelChanged} />
            }
        } else {
            const value = this.props.model[this.props.field.field]
            const field = this.props.field
            if (value === null || value === undefined) {
                return <div />
            }

            if (typeof value === "object" && isEmpty(value) && isEmpty(field.foreign)) {
                return <div />
            }

            if (!this.props) {
                return <div>{"Loading ..."}</div>
            }

            if (field.type === "iterable") {
                return <ListIterableComponent
                    model={value} field={field}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.modelChanged}
                />
            }

            if (field.type === "datepicker") {
                return <ListDateComponent model={value} field={field} />
            }

            if (field.type === "timepicker") {
                return <ListDateComponent model={value} field={field} />
            }

            if (field.type === "datetimezonepicker") {
                return <ListDateTimezoneComponent model={value} field={field} />
            }

            if (field.type === "checkbox") {
                return <ListCheckboxComponent model={value} field={field} />
            }

            if (field.type === "nested") {
                return map(filter(field.fields, (f: any) => f.display && (typeof value[f.field] === "number" || !isEmpty(value[f.field]))), (f: any, index: number) => (
                    <div key={index}>
                        <span>{f.title + " : "}</span>
                        <span>
                            <ListNestedComponent
                                field={f} model={value}
                                additionalModels={this.props.additionalModels}
                                modelChanged={this.modelChanged}
                            />
                        </span>
                    </div>
                ))
            }

            if (field.type === "multiselect") {
                return <ListMultiSelectComponent model={this.props.model[field.field]} field={field.foreign} additionalModels={this.props.additionalModels} />
            }

            if (!isEmpty(field.foreign)) {
                return <ListForeignComponent model={this.props.model[field.field]} field={field.foreign} additionalModels={this.props.additionalModels} />
            }

            if (field.inlineEdit) {
                return <InlineEditComponent text={value} handleChange={this.modelChanged} />
            }
            return <div>{value}</div>
        }
    }
}
