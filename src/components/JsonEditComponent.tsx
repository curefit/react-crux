import autobind from "autobind-decorator"
import * as React from "react"
import * as moment from "moment"
import DatePicker from "react-datepicker"
import { InlineComponentProps } from "../CruxComponent"
import ReactJson, { InteractionProps } from "react-json-view"


@autobind
export class JsonEditComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = { interval: 30 }
    }

    componentWillReceiveProps(nextProps: any) {
        if (nextProps.currentModel) {
            this.setState({ ...this.state, dateTime: moment(nextProps.currentModel) })
        }
    }

    render() {
        const {field, currentModel} = this.props;
        return (
            <div>
                {field.title && <span><label style={{
                    fontSize: "10px",
                    marginRight: "10px"
                }}>{field.title.toUpperCase()}</label><br /></span>}
                <ReactJson
                    style={{ borderWidth: "2px" }}
                    name={field.title}
                    src={currentModel}
                    onAdd={this.handleAdd}
                    onEdit={this.handleEdit}
                    onDelete={this.handleDelete}
                />
            </div>
        )
    }

    handleEdit = (editPayload: InteractionProps) => {
        if (this.props.readonly) {
            return false
        }
        this.props.modelChanged(this.props.field, editPayload.updated_src)
        return true
    }

    handleAdd = (addPayload: InteractionProps) => {
        if (this.props.readonly) {
            return false
        }
        this.props.modelChanged(this.props.field, addPayload.updated_src)
        return true
    }

    handleDelete = (deletePayload: InteractionProps) => {
        if (this.props.readonly) {
            return false
        }
        this.props.modelChanged(this.props.field, deletePayload.updated_src)
        return true
    }

}
