import autobind from "autobind-decorator"
import * as React from "react"
import { NestedEditComponent, InlineComponentProps } from "../CruxComponent"
import { Alert, Modal } from "react-bootstrap"
import { TitleComponent } from "./TitleComponent"

@autobind
export class NestedEditModalComponent extends React.Component<InlineComponentProps, any> {

    constructor(props: any) {
        super(props)
        this.state = { showModal: false, collapsed: props.collapsed ?? props.collapsable ?? false }
    }

    modelChanged = (value: any) => {
        // console.log("props.model", this.props.currentModel, this.props.parentModel)
        // console.log("this.props.index", this.props?.index)
        // console.log("changed value", value)
        if (this.props.index !== null && this.props.index >= 0) {
            this.props.modelChanged(this.props.index, value)
        } else {
            this.props.modelChanged(value)
        }
    }

    getComponent() {
        return (
            <NestedEditComponent
                index={this.props.index}
                readonly={this.props.readonly}
                currentModel={this.props.currentModel}
                fetch={this.props.fetch}
                field={this.props.field}
                additionalModels={this.props.additionalModels}
                nestedIterableModelChanged={this.modelChanged}
                modelChanged={this.modelChanged}
                showTitle={false}
                indent={false}
                collapsable={this.props.field.collapsable}
                nullable={this.props.field.nullable}
                iterableNested={this.props.iterableNested ?? false}
                modalType={this.props.modalType}
                parentModel={this.props.parentModel}
            />
        )
    }

    render() {
        const titleStyle: any = { fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "black", display: "flex" }

        const errorClassName = this.state.error ? "error-animate" : ""

        return <div style={{border: "1px solid #ccc", marginTop: "10px", position: "relative"}}>
            <div style={{ borderBottom: "1px solid #ccc", cursor: "pointer", background: "#eee" }}>
                <TitleComponent modalType={this.props.modalType} field={this.props.field} />
                {this.props.expandable &&
                    <div className="nestedEdit_expand" onClick={() => {this.setState({showModal: true})}}><span>&#10064;</span></div>
                }
                {this.props.collapsable && this.state.collapsed &&
                    <div className="nestedEdit_maximise" onClick={this.collapseToggle}><span>➕</span></div>
                }
                {this.props.collapsable && !this.state.collapsed &&
                    <div className="nestedEdit_minimise" onClick={this.collapseToggle}><span>➖</span></div>
                }
                {this.props.nullable &&
                    <div className="nestedEdit_remove" onClick={() => this.modelChanged(undefined)}><span>✖</span></div>
                }
            </div>
            {this.props.collapsable && !this.state.collapsed && !this.state.showModal && this.getComponent()}
            {!!this.props.expandable && !!this.state.showModal && <Modal
                show={this.props.expandable === true && this.state.showModal === true}
                onHide={() => {
                    this.setState({showModal: false})
                }}
                container={this}
                aria-labelledby="contained-modal-title"
                backdrop={true}
                dialogClassName={errorClassName}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">{this.props.field.field}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-height">
                    {this.getComponent()}
                </Modal.Body>
            </Modal>}
        </div>
    }


    collapseToggle = () => {
        this.setState(Object.assign({}, this.state, { collapsed: !this.state.collapsed }))
    }
}

