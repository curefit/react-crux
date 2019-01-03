import autobind from "autobind-decorator"
import * as React from "react"

@autobind
export class InlineEditComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props)
        this.state = { text: this.props.text, edit: false, loading: false }
    }

    componentWillReceiveProps(nextProps: any) {
        this.setState({ text: nextProps.text, edit: false, loading: false })
    }

    render() {
        return <div>
            {this.state.edit ?
                <input type="text" value={this.state.text}
                       onKeyPress={this.handleEnter}
                       style={{ paddingTop: 5 }}
                       onChange={this.handleChange}
                /> :
                <span onClick={this.startEditing}>{this.state.text}</span>
            }
            {this.state.loading && <i className="fa fa-spinner fa-spin" style={{ fontSize: 12, marginLeft: 10 }} />}
        </div>
    }

    startEditing() {
        this.setState({ ...this.state, edit: true })
    }

    stopEditing() {
        this.setState({ ...this.state, edit: false })
    }

    startLoading() {
        this.setState({ ...this.state, loading: true, edit: false })
    }

    stopLoading() {
        this.setState({ ...this.state, loading: false })
    }

    handleChange(e: any) {
        this.setState({ ...this.state, text: e.target.value })
    }

    handleEnter(e: any) {
        if (e.key === "Enter") {
            this.startLoading()
            this.props.handleChange(this.state.text, this.success, this.error)
        }
    }

    success() {
        this.stopEditing()
        this.stopLoading()
    }

    error(err: any) {
        this.stopLoading()
    }
}
