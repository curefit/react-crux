import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import TimezonePicker from "react-timezone-select"

interface TimezoneComponentProps extends InlineComponentProps {
    isDateTimeComponent?: boolean
}
@autobind
export class TimezoneComponent extends React.Component<TimezoneComponentProps, any> {
    constructor(props: any) {
        super(props)
        const timezone = props.currentModel || "Asia/Kolkata"
        this.state = {
            timezone: timezone,
            isValueChanged: false,
            previousValue
                : this.props.currentModel
        }
    }

    render() {
        return (
            <div style={{ display: this.props.field.displayTimezonePicker || !this.props.isDateTimeComponent ? "flex" : "none", flexDirection: "column", marginLeft: "4px" }}>
                <label style={{ fontSize: "10px", marginRight: "10px" }}>ZONE</label>
                <TimezonePicker
                    value={this.state.timezone}
                    onChange={this.handleTimezoneChange}
                    placeholder="Select Timezone..."
                    name="timezone"
                    className="font-resize"
                />
            </div>
        )
    }

    handleTimezoneChange = (timezone: { value: string }) => {
        this.props.modelChanged(this.props.field, timezone.value)
    }
}
