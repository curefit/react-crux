import autobind from "autobind-decorator"
import * as React from "react"
// import * as moment from "moment"
import * as moment from "moment-timezone"
import DatePicker from "react-datepicker"
import { InlineComponentProps } from "../CruxComponent"
const TimezonePicker = require("react-timezone")

@autobind
export class DatePickerComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = { interval: 30,
            dateTime: props.currentModel ? moment(props.currentModel) : undefined}
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.currentModel) {
            moment.tz.setDefault(this.state.timezone)
            this.setState({ ...this.state, dateTime: moment(nextProps.currentModel) })
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
                        utcOffset={1}
                        showTimeSelect={this.props.field.showTimeSelect}
                        timeIntervals={this.state.interval}
                        dateFormat={this.props.field.showTimeSelect ? "LLL" : "LL"}
                        timeFormat="HH:mm"
                        selected={this.state.dateTime}
                        onChange={this.handleChange}
                    />
                </div>
                { this.props.field.showTimeSelect &&
                <div style={{ display: "flex", flexDirection: "column", marginLeft: "4px" }}>
                    <label style={{ fontSize: "10px", marginRight: "10px" }}>INTERVAL</label>
                    <input type="number" value={this.state.interval} onChange={this.handleIntervalChange} min="0" max="59" />
                </div>}
                { this.props.field.showTimeZone &&
                <div style={{ display: "flex", flexDirection: "column", marginLeft: "4px" }}>
                    <label style={{ fontSize: "10px", marginRight: "10px" }}>ZONE</label>
                    <TimezonePicker.default
                        value={this.state.timezone}
                        onChange={(timezone: any) => this.handleTimezoneChange(timezone)}
                        inputProps={{
                            placeholder: 'Select Timezone...',
                            name: 'timezone',
                        }}
                        className="font-resize"
                    />
                </div>}
            </div>
        )
    }

    handleTimezoneChange = (timezone: string) => {
        this.setState({ timezone, dateTime: moment(this.state.dateTime).tz(timezone) })
    }

    handleIntervalChange = (event: any) => {
        this.setState({ interval: event.target.value })
    }

    handleChange(selected: any) {
        this.props.modelChanged(this.props.field, selected)
    }
}
