import autobind from "autobind-decorator"
import * as React from "react"
import * as moment from "moment-timezone"
import * as Datetime from "react-datetime"
import { InlineComponentProps } from "../CruxComponent"
import { TimezoneComponent } from "./TimezoneComponent"
import { TitleComponent } from "./TitleComponent"
@autobind
export class DateTimezoneComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        const timezone = props.currentModel && props.currentModel.timezone || "Asia/Kolkata"
        moment.tz.setDefault(timezone)
        this.state = {
            interval: 30,
            dateTime: props.currentModel ? moment(props.currentModel.date) : undefined,
            timezone: timezone,
            isValueChanged: false,
            currentDateTime: props.currentModel ? moment(props.currentModel.date) : undefined,
            currentTimeZone: props.currentModel ? moment(props.currentModel.date) : undefined,
        }
    }

    render() {
        return (
            <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
                    <TitleComponent modalType={this.props.modalType} field={this.props.field} isValueChanged={this.state.isValueChanged} />
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

        if (selected === this.state.currentDateTime) {
            this.setState({ dateTime: selected, isValueChanged: false })
        } else {
            this.setState({ dateTime: selected, isValueChanged: true })
        }
        if (moment(selected).isValid()) {
            moment.tz.setDefault(this.state.timezone)
            this.props.modelChanged(this.props.field, { date: selected, timezone: this.state.timezone })
        } else {
            this.props.modelChanged(this.props.field, undefined)
        }
    }

    handleTimezoneChange = (field: any, timezone: string) => {
        if (timezone === this.state.currentTimeZone) {
            this.setState({ dateTime: timezone, isValueChanged: false })
        } else {
            this.setState({ dateTime: timezone, isValueChanged: true })
        }
        this.setState({ timezone, dateTime: moment(this.state.dateTime).tz(timezone), isValueChanged: true })
        this.props.modelChanged(this.props.field, { date: this.state.dateTime, timezone })
    }
}
