import autobind from "autobind-decorator"
import * as React from "react"
import { NestedEditComponent, InlineComponentProps } from "../CruxComponent"

interface IterableNestedComponentProps extends InlineComponentProps {
    collapsable: boolean
    totalLength: number
    collapseNestedToggle: Function
    getIterableNestedTitle: Function
    remove: Function
    addAtIndex: Function
    reorder: Function
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
        if(this.state.reorderClicked) {
            this.setState({ reorderClicked: false })
            this.props.reorder(this.props.index, Number(event.target.getAttribute("data-value")), this.state.moveAtPosition)
        } else {
            this.props.reorder(this.props.index, Number(event.target.getAttribute("data-value")))
        }
        
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
                            <>
                                <span style={iterableButtonStyle}
                                    data-value={0}
                                    className="glyphicon glyphicon-chevron-up" aria-hidden="true"
                                    onClick={this.props.field.additionalButtons.moveAtIndex && !this.state.reorderClicked ? this.handleReorderClick : this.reorder} />
                                {this.state.reorderClicked && 
                                    <input type="number" value={this.state.index} onChange={this.handleIntervalChange} min="0" max={this.props.totalLength - 1} />
                                }
                            </>
                            }
                            {this.props.field.additionalButtons.reorder && this.props.index != this.props.totalLength - 1 &&
                            <>
                                <span style={iterableButtonStyle}
                                    data-value={1}
                                    className="glyphicon glyphicon-chevron-down" aria-hidden="true"
                                    onClick={this.props.field.additionalButtons.moveAtIndex && !this.state.reorderClicked ? this.handleReorderClick : this.reorder} />
                                {this.state.reorderClicked && 
                                    <input type="number" value={this.state.moveAtPosition} onChange={this.handleIntervalChange} min="0" max={this.props.totalLength - 1} />
                                }
                            </>
                            }
                            {this.props.field.additionalButtons.customButton &&
                                <span style={iterableButtonStyle}
                                    className="glyphicon glyphicon-eye-open" aria-hidden="true"
                                    onClick={this.customButtonAction} />}
                        </>
                    }
                    <span style={iterableButtonStyle}
                        className="glyphicon glyphicon-remove-circle" aria-hidden="true"
                        onClick={this.remove} />
                </span>)
        }
        return null
    }

    render() {
        const titleStyle: any = { fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "black", display: "flex" }
        if (this.props.field.iterabletype.nestedIterableCollapse) {
            titleStyle["cursor"] = "pointer"
        }
        return <div key={this.props.index}
            style={this.props.field.iterabletype.style && this.props.field.iterabletype.style.border === "none" ? {} : {
                border: "1px solid #EEE",
                padding: "10px",
                marginTop: "10px"
            }}
            onMouseEnter={this.showIterableButtons}
            onMouseLeave={this.hideIterableButtons}>
            {this.props.field.iterabletype.nestedIterableCollapse && this.props.field.iterabletype.nestedIterableCollapse.title &&
                <div onClick={this.collapseNestedToggle} style={titleStyle}>
                    <div style={{ display: "inline-block", width: "90%" }}>
                        {this.props.getIterableNestedTitle(this.props.index)}
                    </div>
                    {!this.props.collapsable &&
                        <span style={{ marginLeft: "10px", color: "grey", cursor: "pointer" }}
                            className="glyphicon glyphicon-chevron-up" aria-hidden="true" />}
                    {this.props.collapsable &&
                        <span style={{ marginLeft: "10px", color: "grey", cursor: "pointer" }}
                            className="glyphicon glyphicon-chevron-down" aria-hidden="true" />}
                </div>}
            <div style={{ display: "inline-block" }}>
                {!this.props.collapsable &&
                    <NestedEditComponent
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
                        iterableNested={true}
                        modalType={this.props.modalType}
                        parentModel={this.props.parentModel}
                    />}
            </div>
            {this.iterableButtons()}
        </div>
    }
}

