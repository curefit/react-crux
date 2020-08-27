import autobind from "autobind-decorator"
import * as React from "react"
import { Checkbox } from "react-bootstrap"
import { InlineComponentProps } from "../CruxComponent"
import { TitleComponent } from "./TitleComponent"
@autobind
export class CheckboxComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            displayColorPicker: false,
            isValueChanged : false
        }
    }
    
    render() {
        return <div>
            <div>
                <TitleComponent modalType={this.props.modalType}  field={this.props.field} isValueChanged={this.state.isValueChanged} />
                
                <br />
            </div>
            <Checkbox bsClass="custom-checkbox"
                disabled={this.props.readonly}
                onChange={this.handleCheckbox}
                checked={this.props.currentModel === true} />
        </div>
    }

    handleCheckbox = () => {
        this.setState({
            isValueChanged : true
        })
        const newValue = (this.props.currentModel !== true)
        this.props.modelChanged(this.props.field, newValue)
    }
}
