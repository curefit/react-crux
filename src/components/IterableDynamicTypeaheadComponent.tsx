import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import { DynamicTypeaheadComponent } from "./DynamicTypeaheadComponent"
import { getReadOnly } from "../util"
import { isEmpty } from "lodash"

interface IterableDynamicTypeaheadComponentProps extends InlineComponentProps {
    collapsable: boolean
    totalLength: number
    remove: Function
    addAtIndex: Function
    reorder: Function
    type?: string
    options?: any
}

@autobind
export class IterableDynamicTypeaheadComponent extends React.Component<IterableDynamicTypeaheadComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            showIterableButton: false,
            options: props.options || []
        }
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
        this.props.reorder(this.props.index, Number(event.target.getAttribute("data-value")))
    }

    customButtonAction = () => {
        this.props.field.additionalButtons.customButtonAction(this.props.currentModel)
    }

    remove = () => {
        this.props.remove(this.props.index)
    }

    iterableChange = (field: any, value: any, currentOption: any) => {
        this.props.modelChanged(this.props.index, value, currentOption)
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
                                    onClick={this.reorder} />}
                            {this.props.field.additionalButtons.reorder && this.props.index != this.props.totalLength - 1 &&
                                <span style={iterableButtonStyle}
                                    data-value={1}
                                    className="glyphicon glyphicon-chevron-down" aria-hidden="true"
                                    onClick={this.reorder} />}
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

    componentWillReceiveProps(nextProps: any) {
        if (!isEmpty(nextProps.options) && isEmpty(this.state.options)) {
            this.setState({ options: nextProps.options })
        }
    }

    render() {
        return (
            <div key={this.props.index}
                style={this.props.field.iterabletype.displayChildren === "inline" ? {
                    padding: "5px 0px",
                    display: "inline-block",
                    marginRight: "30px"
                } : { padding: "5px 0px" }}
                onMouseEnter={this.showIterableButtons}
                onMouseLeave={this.hideIterableButtons}>
                <div style={this.props.field.iterabletype.style ?
                    Object.assign({}, this.props.field.iterabletype.style, { display: "inline-block" }) : { display: "inline-block" }}>
                    <DynamicTypeaheadComponent
                        readonly={getReadOnly(this.props.field.iterabletype.readonly, this.props.currentModel) || this.props.readonly}
                        constants={this.props.constants}
                        currentModel={this.props.currentModel}
                        fetch={this.props.fetch}
                        field={this.props.field.iterabletype}
                        additionalModels={this.props.additionalModels}
                        modelChanged={this.iterableChange}
                        showTitle={false}
                        parentModel={this.props.parentModel}
                        options={this.props.options}
                        type={this.props.type}
                    />
                </div>
                {this.iterableButtons()}
            </div>
        )
    }
}
