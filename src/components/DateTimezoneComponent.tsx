import autobind from "autobind-decorator"
import * as React from "react"
import * as moment from "moment-timezone"
import * as Datetime from "react-datetime"
import { InlineComponentProps } from "../CruxComponent"
const TimezonePicker = require("react-timezone")

@autobind
export class DateTimezoneComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        const timezone = props.currentModel && props.currentModel.timezone || "Asia/Kolkata"
        moment.tz.setDefault(timezone)
        this.state = {
            interval: 30,
            dateTime: props.currentModel ? moment(props.currentModel.date) : undefined,
            timezone: timezone
        }
    }

    render() {
        return (
            <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
                    <label style={{
                        fontSize: "10px",
                        marginRight: "10px"
                    }}>{this.props.field.title.toUpperCase()}</label>
                    <Datetime
                        value={this.state.dateTime}
                        dateFormat={"LL"}
                        viewDate={this.state.dateTime}
                        onChange={this.handleChange}
                        utc={false}
                        inputProps={{ placeholder: 'Select ' + this.props.field.title, disabled: this.props.readonly }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginLeft: "4px" }}>
                    <label style={{ fontSize: "10px", marginRight: "10px" }}>ZONE</label>
                    <TimezonePicker.default
                        value={this.state.timezone}
                        onChange={this.handleTimezoneChange}
                        inputProps={{
                            placeholder: 'Select Timezone...',
                            name: 'timezone',
                            className: "height-resize"
                        }}
                        className="font-resize"
                    />
                </div>
            </div>
        )
    }

    handleChange = (selected: any) => {
        this.setState({ dateTime: selected })
        this.props.modelChanged(this.props.field, { date: selected, timezone: this.state.timezone })
    }

    handleTimezoneChange = (timezone: string) => {
        this.setState({ timezone, dateTime: moment(this.state.dateTime).tz(timezone) })
        this.props.modelChanged(this.props.field, { date: this.state.dateTime, timezone })
    }
}
