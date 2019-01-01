import autobind from "autobind-decorator"
import * as React from "react"

@autobind
export class ListCheckboxComponent extends React.Component<any, any> {
    render() {
        return <div>{"" + this.props.model}</div>
    }
}
