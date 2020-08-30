import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import ReactJson, { InteractionProps } from "react-json-view"
import { TitleComponent } from "./TitleComponent"

@autobind
export class JsonEditComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = { isValueChanged: false , previousValue
            : this.props.currentModel}
    }
    render() {
        const { field, currentModel } = this.props;
        return (
            <div>
                {field.title && <span>
                    <TitleComponent modalType={this.props.modalType}  field={field} isValueChanged={this.state.isValueChanged}/>
                    <br /></span>}

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
   

        if (addPayload.updated_src === this.state.previousValue) {
            this.setState({
                isValueChanged: false
            })
        } else {
            this.setState({
                isValueChanged: true
            })
        }
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
