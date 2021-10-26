import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import { SelectComponent } from "./SelectComponent"
import { NestedEditComponent } from "./NestedEditComponent"
import { CheckboxComponent } from "./CheckboxComponent"
import { DatePickerComponent } from "./DatePickerComponent"
import { TimePickerComponent } from "./TimePickerComponent"

import { TypeaheadComponent } from "./TypeaheadComponent"
import { ImageUploadComponent } from "./ImageUploadComponent"
import { MultiSelectComponent } from "./MultiSelectComponent"
import { ColorPalleteComponent } from "./ColorPalleteComponent"
import { IterableNestedComponent } from "./IterableNestedComponent"
import { DateTimezoneComponent } from "./DateTimezoneComponent"
import { TimezoneComponent } from "./TimezoneComponent"
import { getReadOnly } from "../util"
import { fetchDynamicTypeaheadResults } from "../Actions"
import { map, isEmpty, concat, pullAt, cloneDeep, get } from "lodash"
import { IterableDynamicTypeaheadComponent } from "./IterableDynamicTypeaheadComponent"
import { v4 } from "uuid"
import { DynamicMultiSelectComponent } from "./DynamicMultiSelectComponent"
import { TitleComponent } from "./TitleComponent"
import InputComponent from "./InputComponent"
import TextAreaComponent from "./TextAreaComponent"
export interface IterableEditComponentProps extends InlineComponentProps {
    anchors: any
}

export interface ImageUploadProps extends IterableEditComponentProps {
    width: string
    height: string
}

@autobind
export class IterableEditComponent extends React.Component<ImageUploadProps | IterableEditComponentProps, any> {
    constructor(props: any) {
        super(props)
        const modalValue = isEmpty(this.props.currentModel) ? [] : JSON.parse(JSON.stringify(this.props.currentModel))
        const collapsedIndexArray: any = []
        collapsedIndexArray.length = modalValue.length
        this.state = {
            model: modalValue,
            checkIterableButton: undefined,
            dynamicTypeaheadOptions: [],
            bigTextChanged: false,
            collapsedIndex: [...collapsedIndexArray.fill(props.field.iterabletype.nestedIterableCollapse ?
                props.field.iterabletype.nestedIterableCollapse.default ? true : false : false, 0)],
            newModel: [...collapsedIndexArray.fill("")]
        }
    }

    componentDidMount() {
        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "dynamicTypeahead") {
            const item: any = {}
            const widgetIds = this.state.model
            item[this.props.field.iterabletype.foreign.bulkKey] = widgetIds
            if (isEmpty(widgetIds)) {
                item["limit"] = 10
            }
            fetchDynamicTypeaheadResults(this.props.field.iterabletype.foreign.modelName, item).then((data: any) => {
                this.setState({
                    dynamicTypeaheadOptions: data.results,
                })
            }).catch((error: any) => {
                console.log("Error while fetching " + this.props.field.iterabletype.foreign.modelName, error)
            })
        }
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.currentModel) {
            this.setState({ model: JSON.parse(JSON.stringify(nextProps.currentModel)) })
        }
    }

    iterableButtons(index: number, totalLength: number) {
        if (this.props.field.iterabletype.readonly !== true && !this.props.readonly) {
            const iterableButtonStyle = { marginLeft: "10px", color: "grey", cursor: "pointer" }
            const visibility = this.state.checkIterableButton && this.state.checkIterableButton[index] ? "visible" : "hidden"
            return (
                <span style={{ visibility }}>
                    {
                        this.props.field.additionalButtons &&
                        <>
                            {this.props.field.additionalButtons.addAtIndex &&
                                <span style={iterableButtonStyle}
                                    className="glyphicon glyphicon-plus" aria-hidden="true"
                                    onClick={this.addAtIndex.bind(this, index)} />}
                            {this.props.field.additionalButtons.reorder && index != 0 &&
                                <span style={iterableButtonStyle}
                                    className="glyphicon glyphicon-chevron-up" aria-hidden="true"
                                    onClick={this.props.field.additionalButtons.moveAtIndex && !this.state.reorderClicked ? this.handleReorderClick : this.reorder.bind(this, index, 0)}/>}
                            {this.props.field.additionalButtons.reorder && index != totalLength - 1 &&
                                <span style={iterableButtonStyle}
                                    className="glyphicon glyphicon-chevron-down" aria-hidden="true"
                                    onClick={this.props.field.additionalButtons.moveAtIndex && !this.state.reorderClicked ? this.handleReorderClick : this.reorder.bind(this, index, 1)}/>}
                            {this.state.reorderClicked && 
                                <input type="number" value={this.state.index} onChange={this.handleIntervalChange} onBlur={this.reorder.bind(this, index, 0, this.state.moveAtPosition)} min="1" max={totalLength} />
                            }
                            {this.props.field.additionalButtons.customButton &&
                                <span style={iterableButtonStyle}
                                    className="glyphicon glyphicon-eye-open" aria-hidden="true"
                                    onClick={this.props.field.additionalButtons.customButtonAction.bind(this, this.state.model[index])} />}
                        </>
                    }
                    <span style={iterableButtonStyle}
                        className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                        onClick={this.remove.bind(this, index)} />
                </span>)
        }
        return null
    }

    showIterableButtons(index: number) {
        let checkIterableButton = this.state.checkIterableButton
        if (!checkIterableButton) {
            checkIterableButton = []
        }
        checkIterableButton[index] = true
        this.setState({
            checkIterableButton
        })
    }

    hideIterableButtons(index: number) {
        let checkIterableButton = this.state.checkIterableButton
        if (!checkIterableButton) {
            checkIterableButton = []
        }
        checkIterableButton[index] = false
        this.setState({
            checkIterableButton
        })
    }

    getRepIterableField = (index: number) => {
        let subTitle = ""
        if (this.props.field.iterabletype.hasOwnProperty("subtitleFn")) {
            subTitle = this.props.field.iterabletype.subtitleFn(this.state.model[index])
            return subTitle
        }
        if (isEmpty(this.state.model[index])) {
            return subTitle
        }
        const repField = this.props.field.iterabletype.fields.find((field: any) => field.iterableRepresentative)
        if (!repField) {
            console.error("Did you forget to add the representative tag at the top level.")
            return subTitle
        }

        if (isEmpty(this.state.model[index][repField.field]) && typeof this.state.model[index][repField.field] !== "number") {
            return subTitle
        }

        if (!isEmpty(repField.foreign)) {
            if (isEmpty(this.props.additionalModels)) {
                return "Loading ....."
            }

            try {
                const foreignDoc = this.props.additionalModels[repField.foreign.modelName]
                    .find((datum: any) => datum[repField.foreign.key] === this.state.model[index][repField.field])
                return foreignDoc ? get(foreignDoc, repField.foreign.title) :
                    this.state.model[index][repField.field] + " - Bad Value"
            } catch (err) {
                return "Loading ...."
            }
        } else if (this.state.model[index][repField.field]) {
            subTitle = this.state.model[index][repField.field]
        }

        return subTitle
    }

    getIterableNestedTitle(index: number) {

        const subTitle = this.getRepIterableField(index)
        return this.props.field.iterabletype.nestedIterableCollapse.title.toUpperCase() + "  " + (index + 1) + (subTitle ? " - " + subTitle : "")
    }

    componentDidUpdate() {
        const uuidArray = this.state.newModel.filter((newModel: string) => !isEmpty(newModel))
        const newModelArray: string[] = []
        newModelArray.length = this.state.model.length
        if (uuidArray.length) {
            this.setState({ newModel: newModelArray.fill("") })
        }
    }

    checkReadonly = (currentModel: any) => {
        return this.props.modalType !== "CREATE" && (getReadOnly(this.props.field.iterabletype.readonly, currentModel) || this.props.readonly)
    }

    render() {
        const totalLength = this.state.model.length
        if (!this.props.field.iterabletype) {
            console.error("Did you forget to add a iterabletype to the field ? Possible culprit:", this.props.field)
        }

        if (!this.props.field.iterabletype.title) {
            console.error("Did you forget to add a title to the iterabletype ? Possible culprit:", this.props.field.iterabletype)
        }

        return <div>
            {!(this.props.field.style && this.props.field.style.hideLabel) &&
                <div onClick={this.collapseToggle} style={{
                    fontSize: "10px",
                    marginRight: "10px"
                }}>
                    <TitleComponent modalType={this.props.modalType} field={this.props.field} isValueChanged={this.state.isValueChanged} />
                </div>
            }
            <div
                style={this.state.collapsed ? { display: "none" } : (!isEmpty(this.state.model) ? ({ padding: 0 }) : { padding: 0 })}>
                {
                    map(this.state.model, ((currentModel: any, index: any) => {
                        const parentModel = {
                            data: this.state.model,
                            parentModel: this.props.parentModel
                        }
                        const readonly = this.checkReadonly(currentModel)
                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "select") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <SelectComponent
                                        modalType={this.props.modalType}
                                        readonly={readonly}
                                        constants={this.props.constants}
                                        currentModel={currentModel}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "searcheableselect") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <MultiSelectComponent
                                        modalType={this.props.modalType}
                                        readonly={readonly}
                                        constants={this.props.constants}
                                        currentModel={currentModel}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                        isMulti={false}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "dynamicMultiselect") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <DynamicMultiSelectComponent
                                        modalType={this.props.modalType}
                                        readonly={readonly}
                                        constants={this.props.constants}
                                        currentModel={currentModel}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                        isMulti={false}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "multiselect") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <MultiSelectComponent
                                        modalType={this.props.modalType}
                                        readonly={readonly}
                                        constants={this.props.constants}
                                        currentModel={currentModel}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                        isMulti={true}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "imageUpload") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <ImageUploadComponent
                                        modalType={this.props.modalType}
                                        constants={this.props.constants}
                                        readonly={readonly}
                                        width={this.props.width}
                                        height={this.props.height} contentType={this.props.field.contentType}
                                        currentModel={currentModel} field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels} modelChanged={this.fieldChanged(index)}
                                        showTitle={false} parentModel={parentModel}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "datepicker") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <DatePickerComponent
                                        modalType={this.props.modalType}
                                        constants={this.props.constants}
                                        currentModel={currentModel}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                        readonly={readonly}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "timepicker") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <TimePickerComponent
                                        modalType={this.props.modalType}
                                        constants={this.props.constants}
                                        currentModel={currentModel}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                        readonly={readonly}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "timezone") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <TimezoneComponent
                                        modalType={this.props.modalType}
                                        field={this.props.field.iterabletype}
                                        readonly={readonly}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        currentModel={currentModel}
                                        parentModel={parentModel}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "datetimezonepicker") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <DateTimezoneComponent field={this.props.field.iterabletype}
                                        readonly={readonly}
                                        modalType={this.props.modalType}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        currentModel={currentModel}
                                        showTitle={false}
                                        parentModel={parentModel}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "typeahead") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index + currentModel}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={this.props.field.iterabletype.style ?
                                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                                    <TypeaheadComponent
                                        modalType={this.props.modalType}
                                        readonly={readonly}
                                        constants={this.props.constants}
                                        currentModel={currentModel}
                                        fetch={this.props.fetch}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "dynamicTypeahead") {
                            return <IterableDynamicTypeaheadComponent

                                key={"iterable" + this.props.field.iterabletype.type + index + this.state.newModel[index]}
                                index={index}
                                readonly={readonly}
                                currentModel={currentModel}
                                fetch={this.props.fetch}
                                field={this.props.field}
                                additionalModels={this.props.additionalModels}
                                modelChanged={this.iterableDynamicTypeaheadFieldChange}
                                modalType={this.props.modalType}
                                parentModel={parentModel}
                                collapsable={this.state.collapsedIndex[index] || false}
                                totalLength={totalLength}
                                remove={this.remove}
                                addAtIndex={this.addAtIndex}
                                reorder={this.reorder}
                                type={"iterable"}
                                options={this.state.dynamicTypeaheadOptions}
                            />
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "nested") {
                            return <IterableNestedComponent
                                key={"iterable" + this.props.field.iterabletype.type + index}
                                index={index}
                                readonly={readonly}
                                currentModel={currentModel}
                                fetch={this.props.fetch}
                                field={this.props.field}
                                additionalModels={this.props.additionalModels}
                                modelChanged={this.nestedFieldChanged}
                                showTitle={false}
                                indent={false}
                                modalType={this.props.modalType}
                                parentModel={parentModel}
                                collapsable={this.state.collapsedIndex[index] || false}
                                totalLength={totalLength}
                                collapseNestedToggle={this.collapseNestedToggle}
                                getIterableNestedTitle={this.getIterableNestedTitle}
                                remove={this.remove}
                                addAtIndex={this.addAtIndex}
                                reorder={this.reorder} />
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "recursive") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={{ border: "1px solid #EEE", padding: "10px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <NestedEditComponent currentModel={currentModel}
                                    readonly={readonly}
                                    fetch={this.props.fetch}
                                    field={Object.assign({}, this.props.anchors[this.props.field.iterabletype.recursivetype], this.props.field.iterabletype.recursiveOverrides)}
                                    additionalModels={this.props.additionalModels}
                                    modelChanged={this.fieldChanged(index).bind(this, undefined)}
                                    showTitle={true} indent={true}
                                    modalType={this.props.modalType}
                                    parentModel={parentModel} />
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "checkbox") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                style={{ display: "inline-block" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <CheckboxComponent
                                    readonly={readonly}
                                    currentModel={currentModel}
                                    modalType={this.props.modalType}
                                    field={this.props.field.iterabletype}
                                    additionalModels={this.props.additionalModels}
                                    modelChanged={this.fieldChanged(index)} showTitle={false}
                                    parentModel={parentModel} />
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "colorpallete") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <ColorPalleteComponent
                                    modalType={this.props.modalType}
                                    field={this.props.field.iterabletype}
                                    modelChanged={this.fieldChanged(index)}
                                    additionalModels={this.props.additionalModels}
                                    currentModel={currentModel}
                                    parentModel={parentModel}
                                />
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "bigtext") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <TextAreaComponent
                                    disabled={readonly}
                                    value={currentModel}
                                    onChange={this.handleChange.bind(this, index, "bigTextChanged")} style={{ width: 250 }}

                                />

                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }
                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "number") {
                            return <div key={"iterable" + this.props.field.iterabletype.type + index}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <InputComponent
                                    disabled={readonly}
                                    type="number"
                                    value={currentModel}
                                    onChange={this.handleChange.bind(this, index, "numberChanged")}
                                    style={{ width: 200, paddingTop: 5 }}
                                />
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }
                        return <div key={"iterable" + this.props.field.iterabletype.type + index}
                            onMouseEnter={this.showIterableButtons.bind(this, index)}
                            onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                            <InputComponent
                                disabled={readonly}
                                type="text"
                                value={currentModel}
                                onChange={this.handleChange.bind(this, index)}
                                style={this.props.field.iterabletype === "tinyinput" ? {
                                    width: 64,
                                    paddingTop: 5
                                } : { width: 200, paddingTop: 5 }}
                            />
                            {this.iterableButtons(index, totalLength)}
                        </div>
                    }))
                }
            </div>
            {this.props.field.iterabletype.readonly !== true && !this.props.readonly &&
                <div className="btn btn-xs btn-passive" style={{ marginTop: "5px" }} onClick={this.createNew}>
                    +Add {this.props.field.iterabletype.title}</div>}
        </div>
    }

    handleChange = (index: any, event: any) => {
        this.setState({
            isValueChanged: true
        })
        const modelCopy = JSON.parse(JSON.stringify(this.state.model))
        if (event.target.value) {
            modelCopy[index] = event.target.type === "number" ? parseFloat(event.target.value) : event.target.value
        } else {
            modelCopy[index] = undefined
        }
        this.props.modelChanged(modelCopy)
    }

    fieldChanged = (index: any) => {
        const self = this
        return function (field: any, value: any) {
            const modelCopy = JSON.parse(JSON.stringify(self.state.model))
            modelCopy[index] = value
            self.props.modelChanged(modelCopy)
        }
    }

    nestedFieldChanged = (index: any, value: any) => {
        this.setState({
            isValueChanged: true
        })
        const modelCopy = JSON.parse(JSON.stringify(this.state.model))
        modelCopy[index] = value
        this.props.modelChanged(modelCopy)
    }

    iterableDynamicTypeaheadFieldChange = (index: any, value: any, currentOption: any) => {
        this.setState({
            isValueChanged: true
        })
        if (value && currentOption) {
            const optionExist = this.state.dynamicTypeaheadOptions.find((option: any) => currentOption.widgetId === option.widgetId)
            if (!optionExist) {
                const newDynamicTypeaheadOptions = [...this.state.dynamicTypeaheadOptions, currentOption]
                this.setState({ dynamicTypeaheadOptions: newDynamicTypeaheadOptions })
            }
        }
        const modelCopy = JSON.parse(JSON.stringify(this.state.model))
        modelCopy[index] = value
        this.props.modelChanged(modelCopy)
    }

    createNew = () => {
        this.setState({
            isValueChanged: true
        })
        this.props.modelChanged(concat(this.state.model, this.getIterableDefaultValue(this.props.field.iterabletype)))
    }

    remove = (index: any) => {
        this.setState({
            isValueChanged: true
        })
        const modelCopy = JSON.parse(JSON.stringify(this.state.model))
        pullAt(modelCopy, index)
        if (modelCopy.length) {
            this.props.modelChanged(modelCopy)
        } else {
            this.props.modelChanged(undefined)
        }
    }

    collapseToggle = () => {
        this.setState(Object.assign({}, this.state, { collapsed: !this.state.collapsed }))
    }

    collapseNestedToggle = (index: number) => {
        if (this.props.field.iterabletype.nestedIterableCollapse) {
            let collapsedIndexArray: any = []
            collapsedIndexArray.length = this.state.model.length
            collapsedIndexArray = collapsedIndexArray.fill(this.props.field.iterabletype.nestedIterableCollapse.default ? true : false, 0)
            collapsedIndexArray[index] = !this.state.collapsedIndex[index]
            this.setState(Object.assign({}, this.state, { collapsedIndex: collapsedIndexArray }))
        }
    }

    addAtIndex = (index: any) => {
        this.setState({
            isValueChanged: true
        })
        const clone = cloneDeep(this.state.model)
        const newModel = this.state.newModel
        newModel[index] = v4()
        this.setState({ newModel })
        clone.splice(index, 0, this.getIterableDefaultValue(this.props.field.iterabletype))
        this.props.modelChanged(clone)
    }

    getIterableDefaultValue = (iterableType: any) => {
        if (iterableType.type === "nested") {
            // Adding Default Value, while creating new Iterable
            const defaultValue: any = {}
            map(this.props.field.iterabletype.fields, field => {
                if (field.hasOwnProperty("defaultValueFn")) {
                    defaultValue[field.field] = field.defaultValueFn(this.props)
                }
            })
            return defaultValue
        } else {
            // Adding Default Value, while creating new Iterable
            if (iterableType.hasOwnProperty("defaultValueFn")) {
                return iterableType.defaultValueFn(this.props)
            }
            return ""
        }
    }

    handleReorderClick = () => {
        this.setState({ reorderClicked: true })
    }

    handleIntervalChange = (event: any) => {
        this.setState({ moveAtPosition: event.target.value })
    }

    reorder(index: any, flag: number, moveAtPosition?: number) {
        this.setState({
            isValueChanged: true
        })
        this.setState({ reorderClicked: false })
        const newModel = this.state.newModel
        const clone = cloneDeep(this.state.model)
        let tempArr, tempData
        if (moveAtPosition !== undefined) {
            tempData = clone[index]
            let i
            clone.splice(index, 1)
            clone.splice(moveAtPosition-1, 0, tempData)
            if(index > moveAtPosition-1) {
                i = moveAtPosition-1
                for (i; i <= index; i++) {
                    newModel[index] = v4()
                }
            } else {
                i = index
                for (i; i <= moveAtPosition-1; i++) {
                    newModel[index] = v4()
                }
            }
        } else {
            if (flag === 0) {
                tempArr = clone[index - 1]
                clone[index - 1] = clone[index]
                newModel[index - 1] = v4()
            }
            else if (flag === 1) {
                tempArr = clone[index + 1]
                clone[index + 1] = clone[index]
                newModel[index + 1] = v4()
            }
            clone[index] = tempArr
            newModel[index] = v4()
        }
        this.setState({ newModel })
        this.props.modelChanged(clone)
    }
}
