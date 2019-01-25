import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import ReactJson, { InteractionProps } from "react-json-view"


@autobind
export class JsonEditComponent extends React.Component<InlineComponentProps, any> {

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
                    name={field.field}
                    src={currentModel}
                    onAdd={this.handleModify}
                    onEdit={this.handleModify}
                    onDelete={this.handleModify}
                />
            </div>
        )
    }

    handleModify = (addPayload: InteractionProps) => {
        if (this.props.readonly) {
            return false
        }
        try {
            JSON.stringify(addPayload.updated_src)
        } catch (e) {
            console.error(`Invalid JSON. Culprit: ${this.props.field}`)
            return false
        }
        this.props.modelChanged(this.props.field, addPayload.updated_src)
        return true
    }

}
