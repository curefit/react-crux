import autobind from "autobind-decorator"
import * as React from "react"
import { includes, has, isEmpty, map, isEqual, filter } from "lodash"
import { InlineComponentProps } from "../CruxComponent"
import { SelectComponent } from "./SelectComponent"
import { TypeaheadComponent } from "./TypeaheadComponent"
import { DatePickerComponent } from "./DatePickerComponent"
import { ImageUploadComponent } from "./ImageUploadComponent"
import { IterableEditComponent } from "./IterableEditComponent"
import { CheckboxComponent } from "./CheckboxComponent"
import { MultiSelectComponent } from "./MultiSelectComponent"
import { JsonEditComponent } from "./JsonEditComponent"
import { ColorPalleteComponent } from "./ColorPalleteComponent"
import { DateTimezoneComponent } from "./DateTimezoneComponent"
import { TimePickerComponent } from "./TimePickerComponent"
import { DynamicTypeaheadComponent } from "./DynamicTypeaheadComponent"
import { TimezoneComponent } from "./TimezoneComponent"
import { getReadOnly } from "../util"
import { DynamicMultiSelectComponent } from "./DynamicMultiSelectComponent"
import { TitleComponent } from "./TitleComponent"
@autobind
export class NestedEditComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = { collapsed: this.props.field.collapsed }
    }

    getEditable(field: any, modalType: string) {
        if (modalType === "CREATE" && has(field, "creatable")) {
            return field.creatable === true
        }

        if (modalType === "CREATE") {
            return field.editable === true
        }

        if (modalType === "EDIT" || modalType === "CUSTOM") {
            return field.editable === true || field.readonly === true
        }

        return false
    }

    checkReadonly = (readonly: boolean, currentModel: any) => {
        return this.props.modalType !== "CREATE" && (getReadOnly(readonly, currentModel) || this.props.readonly)
    }

    getComponentForField(field: any, currentModelWithParent: any) {
        if (field.type === "select") {
            if (field.defaultValue && !(this.props.currentModel && this.props.currentModel[field.field])) {
                this.props.modelChanged(Object.assign({}, this.props.currentModel, { [field.field]: field.defaultValue }))
            }
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}
            return (<SelectComponent field={field}
                readonly={this.checkReadonly(field.readonly, currentModel)}
                additionalModels={this.props.additionalModels}
                modelChanged={this.select}
                currentModel={currentModel}
                showTitle={true}
                parentModel={currentModelWithParent}
            />)
        } else if (field.type === "searcheableselect") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}
            return (
                <MultiSelectComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                    isMulti={false}
                />
            )
        } else if (field.type === "multiselect") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}
            return (
                <MultiSelectComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                    isMulti={true}
                />
            )
        } else if (field.type === "dynamicMultiselect") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}
            return (
                <DynamicMultiSelectComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                    isMulti={true}
                />
            )
        } else if (field.type === "imageUpload") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : undefined
            return (
                <ImageUploadComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    width={this.props.width}
                    height={this.props.height}
                    contentType={field.contentType}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "datepicker") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : undefined
            return (
                <DatePickerComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "datetimezonepicker") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : undefined
            return (
                <DateTimezoneComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                />
            )


        }
        else if (field.type === "timepicker") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : undefined
            return (
                <TimePickerComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                />
            )
        }
        else if (field.type === "timezone") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : undefined
            return (
                <TimezoneComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "typeahead") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}
            return (
                <TypeaheadComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    fetch={this.props.fetch}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    style={field.style}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "dynamicTypeahead") {
            const currentModel = this.props.currentModel && this.props.currentModel[field.field] || ""
            return (
                <DynamicTypeaheadComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    fetch={this.props.fetch}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "nested") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : {}
            return (
                <NestedEditComponent field={field} modalType={this.props.modalType}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    fetch={this.props.fetch}
                    modelChanged={this.select.bind(this, field)}
                    indent={field.style ? (field.style.forceIndent ? true : false) : false}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "iterable") {
            const currentModel = (this.props.currentModel && this.props.currentModel[field.field]) ? this.props.currentModel[field.field] : []
            return (
                <IterableEditComponent field={field} modalType={this.props.modalType}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    fetch={this.props.fetch}
                    modelChanged={this.select.bind(this, field)}
                    indent={true}
                    currentModel={currentModel}
                    parentModel={currentModelWithParent} anchors={this.props.anchors}
                />
            )
        } else if (field.type === "checkbox") {
            const currentModel = (this.props.currentModel !== undefined && this.props.currentModel[field.field] !== undefined) ? this.props.currentModel[field.field] : {}
            return (
                <CheckboxComponent field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "bigtext") {
            const currentModel = this.props.currentModel ? this.props.currentModel[field.field] : ""
            return (
                <div>
                    {!isEmpty(field.title) && <span><TitleComponent field={field} /><br /></span>}

                    <textarea
                        data-value={field.field}
                        disabled={this.checkReadonly(field.readonly, currentModel)}
                        value={currentModel}
                        onChange={this.handleFieldChange}
                        style={{ width: 250 }} />
                </div>
            )
        } else if (field.type === "colorpallete") {
            return (
                <ColorPalleteComponent
                    field={field}
                    modelChanged={this.select}
                    additionalModels={this.props.additionalModels}
                    currentModel={this.props.currentModel ? this.props.currentModel[field.field] : ""}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "json") {
            const currentModel = (this.props.currentModel !== undefined && this.props.currentModel[field.field] !== undefined) ? this.props.currentModel[field.field] : {}
            return (
                <JsonEditComponent
                    field={field}
                    readonly={this.checkReadonly(field.readonly, currentModel)}
                    additionalModels={this.props.additionalModels}
                    modelChanged={this.select}
                    currentModel={currentModel}
                    showTitle={true}
                    parentModel={currentModelWithParent}
                />
            )
        } else if (field.type === "number") {
            const currentModel = this.props.currentModel ? this.props.currentModel[field.field] : ""
            return (
                <div>
                    {!isEmpty(field.title) && <span>
                        <TitleComponent field={field} /><br /></span>}
                    <input type="number"
                        data-value={field.field}
                        disabled={this.checkReadonly(field.readonly, currentModel)}
                        value={currentModel}
                        onChange={this.handleFieldChange}
                        style={{ width: 200, paddingTop: 5 }}
                    />
                </div>
            )
        } else if (field.type === "customedit") {
            const CustomEditComponent = field.customEditComponent
            return (
                <div>
                    {!isEmpty(field.title) && <span>
                        <TitleComponent field={field} />
                        <br /></span>}
                    <CustomEditComponent
                        currentModel={this.props.currentModel}
                        additionalModels={this.props.additionalModels}
                        parentModel={this.props.parentModel}
                        additionalProps={this.props.additionalProps}
                        field={field}
                        handleChange={this.select} />
                </div>
            )
        } else {
            const currentModel = this.props.currentModel ? this.props.currentModel[field.field] : ""
            return (
                <div>
                    {!isEmpty(field.title) && <span>
                        <TitleComponent field={field} />

                        <br />
                    </span>}
                    <input type="text"
                        data-value={field.field}
                        disabled={this.checkReadonly(field.readonly, currentModel)}
                        value={this.props.currentModel ? this.props.currentModel[field.field] : ""}
                        onChange={this.handleFieldChange}
                        style={field.type === "tinyinput" ? {
                            width: 64,
                            paddingTop: 5
                        } : { width: 200, paddingTop: 5 }}
                    />
                </div>
            )
        }
    }

    updateDefaultValue = (props: any) => {
        const newValue: any = {}

        map(props.field.fields, field => {
            if (field.hasOwnProperty("defaultValueFn") && (!props.currentModel || !props.currentModel.hasOwnProperty(field.field))) {
                newValue[field.field] = field.defaultValueFn(props)
            }

            if (field.hasOwnProperty("valueFn")) {
                const resolvedValue = field.valueFn(props)
                if (!isEqual(props.currentModel[field.field], resolvedValue)) {
                    newValue[field.field] = resolvedValue
                }
            }
        })

        if (!isEmpty(newValue)) {
            if (props.iterableNested && props.nestedIterableModelChanged) {
                props.nestedIterableModelChanged(props.index, Object.assign({}, props.currentModel, newValue))
            } else {
                props.modelChanged(Object.assign({}, props.currentModel, newValue))
            }
        }
    }

    componentDidMount() {
        this.updateDefaultValue(this.props)
    }

    componentWillReceiveProps(nextProps: any) {
        this.updateDefaultValue(nextProps)
    }

    render(): any {
        if (isEmpty(this.props) || isEmpty(this.props.field)) {
            console.error("Nested component got empty field prop. Check the parent component. Props:", this.props)
            return <div />
        }

        if (isEmpty(this.props.field.fields)) {
            console.error("Attribute fields missing in the nested component config", this.props.field)
            return <div />
        }

        let fields

        if (this.props.modalType === "CREATE" || this.props.modalType === "EDIT" || this.props.modalType === "CUSTOM") {
            fields = filter(this.props.field.fields, (field: any) => this.getEditable(field, this.props.modalType))
        } else if (this.props.modalType === "FILTER") {
            fields = filter(this.props.field.fields, (field: any) => field.filterParameter === true)
        }

        // Filter out the filed not matching specified conditional field
        fields = filter(fields, (field: any) => {
            if (field.conditionalField) {
                if (Array.isArray(field.conditionalValue)) {
                    return this.props.currentModel && field.conditionalValue.includes(this.props.currentModel[field.conditionalField])
                }
                return this.props.currentModel && this.props.currentModel[field.conditionalField] === field.conditionalValue
            }
            return true
        })

        fields = filter(fields, (field: any) => {
            if (field.shouldRender) {
                if (typeof field.shouldRender === "function") {
                    if (field.shouldRender.length !== 4) {
                        console.error("No. of arguments don't match in the shouldRender function. Function should have 4 args. Possible culprit: ", field.field)
                        return false
                    }
                    return field.shouldRender(field.modelName, this.props.currentModel, this.props.additionalModels, this.props.parentModel)
                } else {
                    console.error("Did you forget to add \"function\" in the shouldRender field. Function should return boolean.")
                    return false
                }
            }
            return true
        })

        const wysiwygFields = filter(fields, (field: any) => (field.wysiwyg === true) && (field.type === "custom"))
        return <div style={this.props.indent ? { border: "1px solid #EEE", padding: "10px" } : { padding: 0 }}>
            {this.props.showTitle && !(this.props.field.style && this.props.field.style.hideLabel) &&
                <div onClick={this.collapseToggle} style={{ cursor: "pointer" }}>
                    <TitleComponent field={this.props.field} />
                </div>}
            <div style={this.state.collapsed ? { display: "none" } : { display: "block" }}>
                <div style={{ display: "inline-block" }}>
                    {
                        map(filter(fields, (field: any) => this.getEditable(field, this.props.modalType) || field.filterParameter === true), (field: any, index: any) => {
                            const currentModelWithParent = { data: this.props.currentModel, parentModel: this.props.parentModel }
                            return <div key={index} style={(this.props.field.displayChildren === "inline") ? {
                                display: "inline-block",
                                marginRight: "10px",
                                marginBottom: "30px",
                                verticalAlign: "top"
                            } : { marginBottom: "30px", marginRight: "10px" }}>
                                <div>
                                    {this.getComponentForField(field, currentModelWithParent)}
                                </div>
                            </div>
                        })
                    }
                </div>
                {
                    !isEmpty(wysiwygFields) &&
                    <div style={{
                        display: "inline-block",
                        marginLeft: "50px",
                        maxWidth: "300px",
                        verticalAlign: "top"
                    }}>
                        {
                            map(wysiwygFields, (field: any, index: number) => {
                                if (field.customComponent) {
                                    const CustomComponent = field.customComponent(this.props.currentModel, this.props.additionalModels, this.props.parentModel, this.props.additionalProps)
                                    return <div key={index}>
                                        <TitleComponent field={field} />
                                        <CustomComponent key={index} />
                                    </div>
                                } else {
                                    const CustomComponent = field.customViewComponent
                                    return <div key={index}>
                                        <TitleComponent field={field} />
                                        <CustomComponent key={index}
                                            currentModel={this.props.currentModel}
                                            additionalModels={this.props.additionalModels}
                                            parentModel={this.props.parentModel}
                                            additionalProps={this.props.additionalProps} />
                                    </div>
                                }
                            })
                        }
                    </div>
                }
            </div>
        </div>
    }

    select = (field: any, eventKey: any) => {
        if (this.props.index >= 0) {
            this.props.modelChanged(this.props.index, Object.assign({}, this.props.currentModel, { [field.field]: eventKey }))
        } else {
            this.props.modelChanged(Object.assign({}, this.props.currentModel, { [field.field]: eventKey }))
        }
    }

    handleChange = (field: any, event: any) => {
        const value: any = event.target.type === "number" ? parseFloat(event.target.value) : event.target.value
        const newModel = Object.assign({}, this.props.currentModel, { [field.field]: value })
        if (this.props.index >= 0) {
            this.props.modelChanged(this.props.index, newModel)
        } else {
            this.props.modelChanged(newModel)
        }
    }

    handleFieldChange = (event: any) => {
        const value: any = event.target.type === "number" ? parseFloat(event.target.value) : event.target.value
        const newModel = Object.assign({}, this.props.currentModel, { [event.target.getAttribute("data-value")]: value })
        if (this.props.index >= 0) {
            this.props.modelChanged(this.props.index, newModel)
        } else {
            this.props.modelChanged(newModel)
        }
    }

    collapseToggle = () => {
        this.setState(Object.assign({}, this.state, { collapsed: !this.state.collapsed }))
    }
}
