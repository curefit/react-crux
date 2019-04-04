import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
const TimezonePicker = require("react-timezone")

@autobind
export class TimezoneComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        const timezone = props.currentModel || "Asia/Kolkata"
        this.state = {
            timezone: timezone
        }
    }

    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column", marginLeft: "4px" }}>
                <label style={{ fontSize: "10px", marginRight: "10px" }}>ZONE</label>
                <TimezonePicker.default
                    value={this.state.timezone}
                    onChange={this.handleTimezoneChange}
                    inputProps={{
                        placeholder: "Select Timezone...",
                        name: "timezone",
                        className: "height-resize"
                    }}
                    className="font-resize"
                />
            </div>
        )
    }

    handleTimezoneChange = (timezone: string) => {
        this.setState({ timezone })
        this.props.modelChanged(this.props.field, timezone)
    }
}
