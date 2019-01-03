import autobind from "autobind-decorator"
import * as React from "react"
import * as moment from "moment"

@autobind
export class ListDateComponent extends React.Component<any, any> {
    render() {
        return <p>{this.props.field.showTimeSelect ? moment(this.props.model).format("LLL") : moment(this.props.model).format("ll")}</p>
    }
}
