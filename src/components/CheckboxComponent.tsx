import autobind from "autobind-decorator"
import * as React from "react"
import { Checkbox } from "react-bootstrap"
import { InlineComponentProps } from "../CruxComponent"

@autobind
export class CheckboxComponent extends React.Component<InlineComponentProps, any> {
    render() {
        return <div>
            <div>
                <label style={{ fontSize: "10px", marginRight: "10px" }}>{this.props.field.title.toUpperCase()}
                    {this.props.field.required ?
                        <span style={{
                            color: 'red',
                            fontSize: 11
                        }}> * </span> : null}
                </label><br />
            </div>
            <Checkbox bsClass="custom-checkbox"
                disabled={this.props.readonly}
                onChange={this.handleCheckbox}
                checked={this.props.currentModel === true} />
        </div>
    }

    handleCheckbox = () => {
        const newValue = (this.props.currentModel !== true)
        this.props.modelChanged(this.props.field, newValue)
    }
}
