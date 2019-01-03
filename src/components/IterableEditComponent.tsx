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
        this.state = {
            model: _.isEmpty(this.props.currentModel) ? [] : JSON.parse(JSON.stringify(this.props.currentModel))
        }
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.currentModel) {
            this.setState(Object.assign({}, this.state, { model: JSON.parse(JSON.stringify(nextProps.currentModel)) }))
        }
    }

    render() {
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
                                        } : { padding: "5px 0px" }}>
                                <div style={{ display: "inline-block" }}>
                                    <SelectComponent
                                        key={index}
                                        constants={this.props.constants}
                                        currentModel={this.state.model[index]}
                                        field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels}
                                        modelChanged={this.fieldChanged(index)}
                                        showTitle={false}
                                        parentModel={parentModel}
                                />
                                </div>
                                <span style={{ marginLeft: "10px", color: "grey" }}
                                      className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                      onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "imageUpload") {
                            return <div key={index}
                                        style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                            padding: "5px 0px",
                                            display: "inline-block",
                                            marginRight: "30px"
                                        } : { padding: "5px 0px" }}>
                                <div style={{ display: "inline-block" }}>
                                    <ImageUploadComponent
                                        constants={this.props.constants}
                                        key={index} width={this.props.width}
                                        height={this.props.height} contentType={this.props.contentType}
                                        currentModel={this.state.model[index]} field={this.props.field.iterabletype}
                                        additionalModels={this.props.additionalModels} modelChanged={this.fieldChanged(index)}
                                        showTitle={false} parentModel={parentModel}
                                />
                                </div>
                                <span style={{ marginLeft: "10px", color: "grey" }}
                                      className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                      onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "datepicker") {
                            return <div key={index}
                                        style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                            padding: "5px 0px",
                                            display: "inline-block",
                                            marginRight: "30px"
                                        } : { padding: "5px 0px" }}>
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
                                />
                                </div>
                                <span style={{ marginLeft: "10px", color: "grey" }}
                                      className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                      onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "typeahead") {
                            return <div key={index}
                                        style={this.props.field.iterabletype.displayChildren === "inline" ? {
                                            padding: "5px 0px",
                                            display: "inline-block",
                                            marginRight: "30px"
                                        } : { padding: "5px 0px" }}>
                                <div style={{ display: "inline-block" }}>
                                    <TypeaheadComponent
                                        key={index}
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
                                <span style={{ marginLeft: "10px", color: "grey" }}
                                      className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                      onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "nested") {
                            return <div key={index}
                                        style={this.props.field.iterabletype.style && this.props.field.iterabletype.style.border === "none" ? {} : {
                                            border: "1px solid #EEE",
                                            padding: "10px"
                                        }}>
                                <div style={{ display: "inline-block" }}>
                                    <NestedEditComponent
                                        key={index}
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
                                <div style={{ marginLeft: "10px", color: "grey" }}
                                     className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                     onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "recursive") {
                            return <div key={index} style={{ border: "1px solid #EEE", padding: "10px" }}>
                                <NestedEditComponent key={index} currentModel={this.state.model[index]}
                                                     fetch={this.props.fetch}
                                                     field={Object.assign({}, this.props.anchors[this.props.field.iterabletype.recursivetype], this.props.field.iterabletype.recursiveOverrides)}
                                                     additionalModels={this.props.additionalModels}
                                                     modelChanged={this.fieldChanged(index).bind(this, undefined)}
                                                     showTitle={true} indent={true}
                                                     modalType={this.props.modalType}
                                                     parentModel={parentModel} />
                                <div style={{ marginLeft: "10px", color: "grey" }}
                                     className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                     onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "checkbox") {
                            return <div style={{ display: "inline-block" }}>
                                <CheckboxComponent key={index} currentModel={this.state.model[index]}
                                                   field={this.props.field.iterabletype}
                                                   additionalModels={this.props.additionalModels}
                                                   modelChanged={this.fieldChanged(index)} showTitle={false}
                                                   parentModel={parentModel} />
                                <div style={{ marginLeft: "10px", color: "grey" }}
                                     className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                     onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "bigtext") {
                            return <div key={index}>
                                        <textarea key={index} value={datum}
                                                  onChange={this.handleChange.bind(this, index)} style={{ width: 250 }} />
                                <div style={{ marginLeft: "10px", color: "grey" }}
                                     className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                     onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        if (this.props.field.iterabletype && this.props.field.iterabletype.type === "number") {
                            return <div key={index}>
                                <input key={index}
                                       disabled={this.props.field.iterabletype.readonly}
                                       type="number"
                                       value={datum}
                                       onChange={this.handleChange.bind(this, index)}
                                       style={{ width: 200, paddingTop: 5 }}
                                />
                                <div style={{ marginLeft: "10px", color: "grey" }}
                                     className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                     onClick={this.remove.bind(this, index)} />
                            </div>
                        }

                        return <div key={index}>
                            <input key={index}
                                   disabled={this.props.field.iterabletype.readonly}
                                   type="text"
                                   value={datum}
                                   onChange={this.handleChange.bind(this, index)}
                                   style={this.props.field.iterabletype === "tinyinput" ? {
                                       width: 64,
                                       paddingTop: 5
                                   } : { width: 200, paddingTop: 5 }}
                            />
                            <div style={{ marginLeft: "10px", color: "grey" }}
                                 className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                                 onClick={this.remove.bind(this, index)} />
                        </div>
                    }))
                }
            </div>
            <div className="btn btn-xs btn-passive" style={{ marginTop: "5px" }} onClick={this.createNew}>
                +Add {this.props.field.iterabletype.title}</div>
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
}
