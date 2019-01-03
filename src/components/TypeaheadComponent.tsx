import autobind from "autobind-decorator"
import * as React from "react"
import * as _ from "lodash"
import { Typeahead } from "react-bootstrap-typeahead"
import { InlineComponentProps } from "../CruxComponent"

@autobind
export class TypeaheadComponent extends React.Component<InlineComponentProps, any> {
    render() {
        const options = _.isEmpty(this.props.field.foreign.orderby)
            ? this.props.additionalModels[this.props.field.foreign.modelName]
            : _.sortBy(this.props.additionalModels[this.props.field.foreign.modelName], (doc: any) => _.trim(doc[this.props.field.foreign.orderby].toLowerCase()))

        const selected = _.find(options, (option: any) => option[this.props.field.foreign.key] === this.props.currentModel)
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
        <Typeahead labelKey={this.props.field.foreign.title} onChange={this.handleChange} options={options}
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
