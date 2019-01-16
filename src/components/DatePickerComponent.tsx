import autobind from "autobind-decorator"
import * as React from "react"
import * as moment from "moment"
import DatePicker from "react-datepicker"
import { InlineComponentProps } from "../CruxComponent"

@autobind
export class DatePickerComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = {}
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.currentModel) {
            this.setState({ ...this.state, dateTime: moment(nextProps.currentModel) })
        }
    }

    render() {
        return (
            <div>
                <label style={{
                    fontSize: "10px",
                    marginRight: "10px"
                }}>{this.props.field.title.toUpperCase()}</label><br />
                <DatePicker
                    showTimeSelect={!!this.props.field.showTimeSelect}
                    timeIntervals={30}
                    dateFormat={this.props.field.showTimeSelect ? "LLL" : "LL"}
                    timeFormat="HH:mm"
                    selected={this.state.dateTime}
                    onChange={this.handleChange}
                    className="autowidth"
                    disabled={this.props.readonly}
                />
            </div>
        )
    }

    handleChange(selected: any) {
        this.props.modelChanged(this.props.field, selected)
    }
}
