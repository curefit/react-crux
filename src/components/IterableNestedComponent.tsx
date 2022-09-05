import autobind from "autobind-decorator"
import * as React from "react"
import { NestedEditComponent, InlineComponentProps } from "../CruxComponent"
import { NestedEditModalComponent } from "./NestedEditModalComponent"
import { TitleComponent } from "./TitleComponent"

interface IterableNestedComponentProps extends InlineComponentProps {
    collapsable: boolean
    collapsed: boolean
    totalLength: number
    collapseNestedToggle: Function
    getIterableNestedTitle: Function
    remove: Function
    addAtIndex: Function
    reorder: Function
    reorderAtPosition: Function
}

@autobind
export class IterableNestedComponent extends React.Component<IterableNestedComponentProps, any> {

    constructor(props: any) {
        super(props)
        this.state = { showIterableButton: false }
    }

    collapseNestedToggle = () => {
        this.props.collapseNestedToggle(this.props.index)
    }

    showIterableButtons = () => {
        this.setState({ showIterableButton: true })
    }

    hideIterableButtons = () => {
        this.setState({ showIterableButton: false })
    }

    addAtIndex = () => {
        this.props.addAtIndex(this.props.index)
    }

    reorder = (event: any) => {
        this.setState({ reorderClicked: false })
        this.props.reorder(this.props.index, Number(event.target.getAttribute("data-value")))
    }

    reorderAtPosition = () => {
        this.setState({ reorderClicked: false })
        this.props.reorderAtPosition(this.props.index, this.state.moveAtPosition)
    }

    remove = () => {
        this.props.remove(this.props.index)
    }

    customButtonAction = () => {
        this.props.field.additionalButtons.customButtonAction(this.props.currentModel)
    }

    handleReorderClick = () => {
        this.setState({ reorderClicked: true })
    }

    handleIntervalChange = (event: any) => {
        this.setState({ moveAtPosition: event.target.value })
    }

    iterableButtons = () => {
        if (!this.props.readonly) {
            const iterableButtonStyle = { marginLeft: "10px", color: "grey", cursor: "pointer" }
            const visibility = this.state.showIterableButton ? "visible" : "hidden"
            return (
                <span style={{ visibility }}>
                    {
                        this.props.field.additionalButtons &&
                        <>
                            {this.props.field.additionalButtons.addAtIndex &&
                                <span style={iterableButtonStyle}
                                    className="glyphicon glyphicon-plus" aria-hidden="true"
                                    onClick={this.addAtIndex} />}
                            {this.props.field.additionalButtons.reorder && this.props.index != 0 &&
                                <span style={iterableButtonStyle}
                                    data-value={0}
                                    className="glyphicon glyphicon-chevron-up" aria-hidden="true"
                                    onClick={this.props.field.additionalButtons.moveAtIndex && !this.state.reorderClicked ? this.handleReorderClick : this.reorder} />
                            }
                            {this.props.field.additionalButtons.reorder && this.props.index != this.props.totalLength - 1 &&
                                <span style={iterableButtonStyle}
                                    data-value={1}
                                    className="glyphicon glyphicon-chevron-down" aria-hidden="true"
                                    onClick={this.props.field.additionalButtons.moveAtIndex && !this.state.reorderClicked ? this.handleReorderClick : this.reorder} />
                            }
                            {this.state.reorderClicked && 
                                <input type="number" value={this.state.index} onChange={this.handleIntervalChange} onBlur={this.reorderAtPosition} min="1" max={this.props.totalLength} />
                            }
                            {this.props.field.additionalButtons.customButton &&
                                <span style={iterableButtonStyle}
                                    className="glyphicon glyphicon-eye-open" aria-hidden="true"
                                    onClick={this.customButtonAction} />}
                        </>
                    }
                </span>
            )
        }
        return null
    }

    render() {
        const titleStyle: any = { fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "black", display: "flex" }
        if (this.props.field.iterabletype.nestedIterableCollapse) {
            titleStyle["cursor"] = "pointer"
        }
        return <div key={this.props.index} style={{marginTop: "10px", border: "1px solid #ccc", position: "relative"}} onMouseEnter={this.showIterableButtons} onMouseLeave={this.hideIterableButtons}>
            <div style={{borderBottom: "1px solid #ccc", cursor: "pointer", background: "#eee"}}>
                <label className="title_label mr-2">{this.props.getIterableNestedTitle(this.props.index)}</label>
            </div>
            <div style={{ display: "inline-block", padding: "10px" }}>
                {!this.props.collapsed &&
                    <NestedEditModalComponent
                        index={this.props.index}
                        readonly={this.props.readonly}
                        currentModel={this.props.currentModel}
                        fetch={this.props.fetch}
                        field={this.props.field.iterabletype}
                        additionalModels={this.props.additionalModels}
                        nestedIterableModelChanged={this.props.modelChanged}
                        modelChanged={this.props.modelChanged}
                        showTitle={false}
                        indent={false}
                        collapsable={this.props.field.iterabletype.collapsable ?? true}
                        expandable={this.props.field.iterabletype.expandable ?? false}
                        nullable={this.props.field.iterabletype.nullable ?? false}
                        iterableNested={true}
                        modalType={this.props.modalType}
                        parentModel={this.props.parentModel}
                    />
                }
            </div>
            {this.props.collapsable && this.props.collapsed &&
                <div className="iterableNested_maximise" onClick={this.collapseNestedToggle}><span>➕</span></div>
            }
            {this.props.collapsable && !this.props.collapsed &&
                <div className="iterableNested_minimise" onClick={this.collapseNestedToggle}><span>➖</span></div>
            }
            {this.props.nullable &&
                <div className="iterableNested_remove" onClick={this.remove}><span>✖</span></div>
            }
            {this.iterableButtons()}
        </div>
    }
}

