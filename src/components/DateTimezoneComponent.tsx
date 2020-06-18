import autobind from "autobind-decorator"
import * as React from "react"
import * as moment from "moment-timezone"
import * as Datetime from "react-datetime"
import { InlineComponentProps } from "../CruxComponent"
import { TimezoneComponent } from "./TimezoneComponent"

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
                    }}>{this.props.field.title.toUpperCase()}
                    {this.props.field.required ?
                        <span style={{
                            color: 'red',
                            fontSize: 11
                        }}> * </span> : null}
                    </label>
                    <Datetime
                        value={this.state.dateTime}
                        dateFormat={"LL"}
                        onChange={this.handleChange}
                        utc={false}
                        timeFormat={"HH:mm"}
                        inputProps={{ placeholder: "Select " + this.props.field.title, disabled: this.props.readonly }}
                    />
                </div>
                <TimezoneComponent
                    currentModel={this.state.timezone}
                    modelChanged={this.handleTimezoneChange}
                    field={this.props.field}
                    additionalModels={this.props.additionalModels}
                    parentModel={this.props.parentModel}
                />
            </div>
        )
    }

    handleChange = (selected: any) => {
        this.setState({ dateTime: selected })
        if (moment(selected).isValid()) {
            this.props.modelChanged(this.props.field, { date: selected, timezone: this.state.timezone })
        } else {
            this.props.modelChanged(this.props.field, undefined)
        }
    }

    handleTimezoneChange = (field: any, timezone: string) => {
        this.setState({ timezone, dateTime: moment(this.state.dateTime).tz(timezone) })
        this.props.modelChanged(this.props.field, { date: this.state.dateTime, timezone })
    }
}
