import autobind from "autobind-decorator"
import * as React from "react"
import * as _ from "lodash"
import { Typeahead } from "react-bootstrap-typeahead"
import { InlineComponentProps } from "../CruxComponent"

@autobind
export class TypeaheadComponent extends React.Component<InlineComponentProps, any> {
    render() {
        let optionsData = []
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

        let selected = _.find(optionsData, (option: any) => option[this.props.field.foreign.key] === this.props.currentModel)
        if (!selected && this.props.currentModel && typeof this.props.currentModel === "string") {
            selected = { title: this.props.currentModel + " - Bad Value", typeId: this.props.currentModel }
        }
        return <div>
            {
                this.props.showTitle &&
                !(this.props.field.style && this.props.field.style.hideLabel) &&
                <div>
                    <label style={{
                        fontSize: "10px",
                        marginRight: "10px"
                    }}>{this.props.field.title.toUpperCase()}</label>
                    {this.props.field.showRefresh &&
                        <span style={{ float: "right", fontSize: "10px" }}>
                            <span style={{ marginLeft: "20px", color: "grey" }}
                                className="glyphicon glyphicon-refresh" aria-hidden="true"
                                onClick={this.refreshMovements} />
                        </span>}

                    <br />
                </div>
            }
            <Typeahead labelKey={this.props.field.foreign.title}
                onChange={this.handleChange} options={optionsData}
                disabled={this.props.readonly}
                selected={selected ? [selected] : undefined} />
        </div>
    }

    refreshMovements = () => {
        this.props.fetch("movements")
    }

    handleChange = (selected: any) => {
        if (!_.isEmpty(selected)) {
            const newObject = selected[0]
            this.props.modelChanged(this.props.field, newObject[this.props.field.foreign.key])
        }
    }
}
