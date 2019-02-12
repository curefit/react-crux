import autobind from "autobind-decorator"
import * as React from "react"
import * as _ from "lodash"
import { InlineComponentProps } from "../CruxComponent"
import { SelectComponent } from "./SelectComponent"
import { NestedEditComponent } from "./NestedEditComponent"
import { CheckboxComponent } from "./CheckboxComponent"
import { DatePickerComponent } from "./DatePickerComponent"
import { TypeaheadComponent } from "./TypeaheadComponent"
import { ImageUploadComponent } from "./ImageUploadComponent"
import { MultiSelectComponent } from "./MultiSelectComponent"

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
        const modalValue = _.isEmpty(this.props.currentModel) ? [] : JSON.parse(JSON.stringify(this.props.currentModel))
        const collapsedIndexArray: any = []
        collapsedIndexArray.length = modalValue.length
        this.state = {
            model: modalValue,
            checkIterableButton: undefined,
            collapsedIndex: collapsedIndexArray.fill(props.field.iterabletype.defaultCollapse ? true : false, 0)
        }
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.currentModel) {
            this.setState(Object.assign({}, this.state, { model: JSON.parse(JSON.stringify(nextProps.currentModel)) }))
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
                                    onClick={this.reorder.bind(this, index, 0)} />}
                            {this.props.field.additionalButtons.reorder && index != totalLength - 1 &&
                                <span style={iterableButtonStyle}
                                    className="glyphicon glyphicon-chevron-down" aria-hidden="true"
                                    onClick={this.reorder.bind(this, index, 1)} />}
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

        if (!this.props.field.iterabletype.subTitle) {
            return subTitle
        }

        if (this.props.field.iterabletype.subTitle && this.state.model[index] &&
            this.state.model[index][this.props.field.iterabletype.subTitle]) {
            subTitle = this.state.model[index][this.props.field.iterabletype.subTitle]
        }

        const repField = this.props.field.iterabletype.fields.find((field: any) => field.iterableRepresentative)
        if (!repField) {
            console.error("Did you forget to add the representative tag at the top level.")
            return subTitle
        }

        if (!_.isEmpty(repField.foreign)) {
            if (_.isEmpty(this.props.additionalModels)) {
                return "Loading ....."
            }

            try {
                if (_.isEmpty(subTitle) && !_.isNumber(subTitle)) {
                    return ""
                }
                const foreignDoc = this.props.additionalModels[repField.foreign.modelName]
                    .find((datum: any) => datum[repField.foreign.key] === subTitle)
                return foreignDoc ? _.get(foreignDoc, repField.foreign.title) :
                    subTitle + " - Bad Value"
            } catch (err) {
                return "Loading ...."
            }
        }

        return subTitle
    }

    getIterableNestedTitle(index: number) {
        const subTitle = this.getRepIterableField(index)
        return this.props.field.iterabletype.title.toUpperCase() + "  " + (index + 1) + " - " +  subTitle
    }

    render() {
        let totalLength = this.state.model.length
        // console.log("iterable",  this.props.field.title, " Parent ", this.props.parentModel)
        if (!this.props.field.iterabletype) {
            console.error("Did you forget to add a iterabletype to the field ? Possible culprit:", this.props.field)
        }

        if (!this.props.field.iterabletype.title) {
            console.error("Did you forget to add a title to the iterabletype ? Possible culprit:", this.props.field.iterabletype)
        }

        return <div>
            {!(this.props.field.style && this.props.field.style.hideLabel) &&
                <label onClick={this.collapseToggle} style={{
                    fontSize: "10px",
                    marginRight: "10px"
                }}>{this.props.field.title.toUpperCase()}</label>}
            <div
                style={this.state.collapsed ? { display: "none" } : (!_.isEmpty(this.state.model) ? ({ padding: 0 }) : { padding: 0 })}>
                {
                    _.map(this.state.model, ((datum: any, index: any) => {
                        const parentModel = {
                            data: this.state.model,
                            parentModel: this.props.parentModel
                        }
                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "select") {
                            return <div key={index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={{ display: "inline-block" }}>
                                    <SelectComponent
                                        key={index}
                                        readonly={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                        constants={this.props.constants}
                                        currentModel={this.state.model[index]}
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
                            return <div key={index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={{ display: "inline-block" }}>
                                    <MultiSelectComponent
                                        key={index}
                                        readonly={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                        constants={this.props.constants}
                                        currentModel={this.state.model[index]}
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
                            return <div key={index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={{ display: "inline-block" }}>
                                    <MultiSelectComponent
                                        key={index}
                                        readonly={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                        constants={this.props.constants}
                                        currentModel={this.state.model[index]}
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
                            return <div key={index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={{ display: "inline-block" }}>
                                    <ImageUploadComponent
                                        constants={this.props.constants}
                                        readonly={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                        key={index} width={this.props.width}
                                        height={this.props.height} contentType={this.props.contentType}
                                        currentModel={this.state.model[index]} field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels} modelChanged={this.fieldChanged(index)}
                                        showTitle={false} parentModel={parentModel}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "datepicker") {
                            return <div key={index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={{ display: "inline-block" }}>
                                    <DatePickerComponent
                                        key={index}
                                        constants={this.props.constants}
                                        currentModel={this.state.model[index]}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                        readonly={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "typeahead") {
                            return <div key={index}
                                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                    padding: "5px 0px",
                                    display: "inline-block",
                                    marginRight: "30px"
                                } : { padding: "5px 0px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <div style={{ display: "inline-block" }}>
                                    <TypeaheadComponent
                                        key={index}
                                        readonly={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                        constants={this.props.constants}
                                        currentModel={this.state.model[index]}
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

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "nested") {
                            const titleStyle: any = { fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "black" }
                            if (this.props.field.iterabletype.collapsable) {
                                titleStyle["cursor"] = "pointer"
                            }
                            return <div key={index}
                                style={this.props.field.iterabletype.style && this.props.field.iterabletype.style.border === "none" ? {} : {
                                    border: "1px solid #EEE",
                                    padding: "10px",
                                    marginTop: "10px"
                                }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                {this.props.field.iterabletype.title &&
                                    <div onClick={this.collapseNestedToggle.bind(this, index)} style={titleStyle}>
                                        {this.getIterableNestedTitle(index)}</div>}
                                <div style={this.state.collapsedIndex[index] ? { display: "none" } : { display: "inline-block" }}>
                                    <NestedEditComponent
                                        readonly={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                        currentModel={this.state.model[index]}
                                        fetch={this.props.fetch}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index).bind(this, undefined)}
                                        showTitle={false}
                                        indent={false}
                                        modalType={this.props.modalType}
                                        parentModel={parentModel}
                                    />
                                </div>
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "recursive") {
                            return <div key={index} style={{ border: "1px solid #EEE", padding: "10px" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <NestedEditComponent key={index} currentModel={this.state.model[index]}
                                    readonly={this.props.field.iterabletype.readonly === true || this.props.readonly}
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
                            return <div style={{ display: "inline-block" }}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <CheckboxComponent key={index}
                                    readonly={this.props.field.iterable.readonly === true || this.props.readonly}
                                    currentModel={this.state.model[index]}
                                    field={this.props.field.iterabletype}
                                    additionalModels={this.props.additionalModels}
                                    modelChanged={this.fieldChanged(index)} showTitle={false}
                                    parentModel={parentModel} />
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "bigtext") {
                            return <div key={index}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <textarea
                                    key={index}
                                    disabled={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                    value={datum}
                                    onChange={this.handleChange.bind(this, index)} style={{ width: 250 }} />
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "number") {
                            return <div key={index}
                                onMouseEnter={this.showIterableButtons.bind(this, index)}
                                onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                                <input key={index}
                                    disabled={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                    type="number"
                                    value={datum}
                                    onChange={this.handleChange.bind(this, index)}
                                    style={{ width: 200, paddingTop: 5 }}
                                />
                                {this.iterableButtons(index, totalLength)}
                            </div>
                        }

                        return <div key={index}
                            onMouseEnter={this.showIterableButtons.bind(this, index)}
                            onMouseLeave={this.hideIterableButtons.bind(this, index)}>
                            <input key={index}
                                disabled={this.props.field.iterabletype.readonly === true || this.props.readonly}
                                type="text"
                                value={datum}
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
        const modelCopy = JSON.parse(JSON.stringify(this.state.model))
        modelCopy[index] = event.target.type === "number" ? parseFloat(event.target.value) : event.target.value
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

    createNew = () => {
        if (this.props.field.iterabletype.type === "nested") {
            this.props.modelChanged(_.concat(this.state.model, {}))
        } else {
            this.props.modelChanged(_.concat(this.state.model, ""))
        }
    }

    remove = (index: any) => {
        const modelCopy = JSON.parse(JSON.stringify(this.state.model))
        _.pullAt(modelCopy, index)
        this.props.modelChanged(modelCopy)
    }

    collapseToggle = () => {
        this.setState(Object.assign({}, this.state, { collapsed: !this.state.collapsed }))
    }

    collapseNestedToggle = (index: number) => {
        if (this.props.field.iterabletype.collapsable) {
            let collapsedIndexArray: any = []
            collapsedIndexArray.length = this.state.model.length
            collapsedIndexArray = collapsedIndexArray.fill(this.props.field.iterabletype.defaultCollapse ? true : false, 0)
            collapsedIndexArray[index] = !this.state.collapsedIndex[index]
            this.setState(Object.assign({}, this.state, { collapsedIndex: collapsedIndexArray }))
        }
    }

    addAtIndex = (index: any) => {
        const clone = _.cloneDeep(this.state.model)
        if (this.props.field.iterabletype.type === "nested") {
            clone.splice(index, 0, {});
        } else {
            clone.splice(index, 0, "");
        }
        this.props.modelChanged(clone)
    }

    reorder(index: any, flag: number) {
        const clone = _.cloneDeep(this.state.model)
        let tempArr
        if (flag === 0) {
            tempArr = clone[index - 1]
            clone[index - 1] = clone[index]
        }
        else if (flag === 1) {
            tempArr = clone[index + 1]
            clone[index + 1] = clone[index]
        }
        clone[index] = tempArr
        this.props.modelChanged(clone)
    }
}
