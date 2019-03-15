import autobind from "autobind-decorator"
import * as React from "react"
import * as moment from "moment"
import DatePicker from "react-datepicker"
import { InlineComponentProps } from "../CruxComponent"

@autobind
export class DatePickerComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = { interval: 30,
            dateTime: props.currentModel ? moment(props.currentModel) : undefined}
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.currentModel) {
            this.setState({ ...this.state, dateTime: moment(nextProps.currentModel) })
        } else {
            this.setState({ dateTime: undefined })
        }
    }

    render() {
        return (
            <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{
                        fontSize: "10px",
                        marginRight: "10px"
                    }}>{this.props.field.title.toUpperCase()}</label>
                    <DatePicker
                        showTimeSelect={this.props.field.showTimeSelect}
                        timeIntervals={this.state.interval}
                        dateFormat={this.props.field.showTimeSelect ? "LLL" : "LL"}
                        timeFormat="HH:mm"
                        selected={this.state.dateTime}
                        onChange={this.handleChange}
                    />
                </div>
                { this.props.field.showTimeSelect &&
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: "10px", marginRight: "10px" }}>Time Interval</label>
                    <input type="number" value={this.state.interval} onChange={this.handleIntervalChange} min="0" max="59" />
                </div>}
            </div>
        )
    }

    handleIntervalChange = (event: any) => {
        this.setState({ interval: event.target.value })
    }

    handleChange(selected: any) {
        this.props.modelChanged(this.props.field, selected)
    }
}
