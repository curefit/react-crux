import autobind from "autobind-decorator"
import * as React from "react"
import { InlineComponentProps } from "../CruxComponent"
import { SketchPicker } from "react-color"
import reactCSS from "reactcss"

@autobind
export class ColorPalleteComponent extends React.Component<InlineComponentProps, any> {

    constructor(props: any) {
        super(props)
        this.state = {
            displayColorPicker: false
        }
    }

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    }

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    }

    handleColorChange = (color: any) => {
        this.props.modelChanged(this.props.field, color.hex)
    }

    componentDidMount() {
        if (!this.props.currentModel) {
            this.props.modelChanged(this.props.field, this.props.currentModel || this.props.field.defaultValue || "#cecece")
        }
    }

    convertHex(hex: string, opacity: number) {
        hex = hex.replace("#", "")
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
    }

    render() {
        const styles = reactCSS({
            "default": {
                color: {
                    width: "36px",
                    height: "14px",
                    borderRadius: "2px",
                    background: `${this.convertHex(this.props.currentModel || this.props.field.defaultValue || "#cecece", 100)}`,
                },
                swatch: {
                    padding: "5px",
                    background: "#fff",
                    borderRadius: "1px",
                    boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                    display: "inline-block",
                    cursor: "pointer",
                },
                popover: {
                    position: "absolute" as "absolute",
                    zIndex: 2,
                },
                cover: {
                    position: "fixed" as "fixed",
                    top: "0px",
                    right: "0px",
                    bottom: "0px",
                    left: "0px",
                },
            },
        })

        return <div>
            <div>
                <label style={{ fontSize: "10px", marginRight: "10px" }}>{this.props.field.title.toUpperCase()}
                {this.props.field.required ?
                        <span style={{
                            color: 'red',
                            fontSize: 11
                        }}> * </span> : null}
                </label><br />
            </div>
            <div style={styles.swatch} onClick={this.handleClick}>
                <div style={styles.color} />
            </div>
            {this.state.displayColorPicker ?
            <div style={styles.popover}>
                <div onClick={this.handleClose} style={styles.cover} />
                <SketchPicker color={{ hex: this.convertHex(this.props.currentModel || this.props.field.defaultValue || "#cecece", 100)}}
                    onChange={this.handleColorChange} />
            </div> : null}
        </div>
    }
}
