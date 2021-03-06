import autobind from "autobind-decorator"
import * as React from "react"
import * as moment from "moment-timezone"
import { InlineComponentProps } from "../CruxComponent"
import TimePicker from 'rc-time-picker';
import { TitleComponent } from "./TitleComponent"

const format = 'h:mm a';

const now = moment()
    .hour(0)
    .minute(0);

@autobind
export class TimePickerComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
    }

    render() {
        const { readonly, currentModel } = this.props;
        return (
            <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column", width: "250px" }}>
                <TitleComponent field={this.props.field} />
                    <TimePicker
                        defaultValue={now}
                        value={currentModel ? moment(currentModel, format): now}
                        onChange={this.handleChange}
                        format={format}
                        disabled={readonly}
                        showSecond={false}
                        use12Hours
                    />
                </div>
            </div>
        )
    }

    handleChange = (value: any) => {
        this.props.modelChanged(this.props.field, value.format(format))
    }
}
