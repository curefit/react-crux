import autobind from "autobind-decorator"
import * as React from "react"
import { Checkbox } from "react-bootstrap"
import { InlineComponentProps } from "../CruxComponent"
import { TitleComponent } from "./TitleComponent"
@autobind
export class CheckboxComponent extends React.Component<InlineComponentProps, any> {
    render() {
        return <div>
            <div>
                <TitleComponent field={this.props.field} />
                
                <br />
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
