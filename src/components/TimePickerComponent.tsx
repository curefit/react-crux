import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import TimePicker from 'react-time-picker';
import { TitleComponent } from "./TitleComponent"

const moment = require("moment-timezone")

const format = 'h:mm a';

@autobind
export class TimePickerComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = { isValueChanged: false , previousValue
            : this.props.currentModel}
    }

    render() {
        const { readonly, currentModel } = this.props;
        return (
            <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
                <TitleComponent modalType={this.props.modalType}  field={this.props.field} isValueChanged={this.state.isValueChanged}/>
                    <TimePicker
                        value={currentModel ? moment(currentModel, format).format("HH:mm") : null}
                        onChange={this.handleChange}
                        format={format}
                        disabled={readonly}
                    />
                </div>
            </div>
        )
    }

    handleChange = (value: any) => {
        if (!value) return
        const formattedValue = moment(value, "HH:mm").format(format)
        if (formattedValue === this.state.previousValue) {
            this.setState({
                isValueChanged: false
            })
        } else {
            this.setState({
                isValueChanged: true
            })
        }
        this.props.modelChanged(this.props.field, formattedValue)
    }
}
