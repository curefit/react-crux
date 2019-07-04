import autobind from "autobind-decorator"
import * as React from "react"
import * as upload from "superagent"
import { InlineComponentProps } from "../CruxComponent"
import { FetchUtil } from "./../../src/FetchUtil"
let Dropzone = require("react-dropzone")
if ("default" in Dropzone) {
    Dropzone = Dropzone.default
}

@autobind
export class ImageUploadComponent extends React.Component<InlineComponentProps, any> {
    constructor(props: any) {
        super(props)
        this.state = {
            inProgress: false
        }
    }

    onDrop(files: any, width: string, height: string, contentType: string) {
        const formData = new FormData()
        formData.append("images", files[0])
        if (width) {
            formData.append("width", width)
        }
        if (height) {
            formData.append("height", height)
        }
        this.setState(Object.assign({}, this.state, { inProgress: true }))
        if (this.props.item && this.props.item["contentType"] && this.props.item["contentType"] !== contentType) {
            contentType = this.props.item["contentType"]
        }
        upload.post("/content/" + contentType + "/upload/").send(formData)
            .end((err: any, res: any) => {
                this.setState(Object.assign({}, this.state, { inProgress: false }))
                if (res.status !== 200) {
                    const data = JSON.parse(res.text)
                    alert("Error: " + data.message)
                }
                else {
                    const data = JSON.parse(res.text)
                    this.props.modelChanged(this.props.field, data.url)
                    alert("File uploaded successfully")
                }
            })
    }

    removeFile = () => {
        this.props.modelChanged(this.props.field, undefined)
    }

    previewUpload = () => {
        if (this.props.contentType === "video") {
            return <video width="240px" height="200px" controls src={this.getUrl(this.props.currentModel, this.props.field)}/>
        }
        return <img style={{ maxWidth: "150px", height: "75px", objectFit: "contain" }} src={this.getUrl(this.props.currentModel, this.props.field)} />
    }

    render() {
        return (
            <div>
                <Dropzone style={{ width: "140px", textAlign: "center", color: "#E2356F" }}
                    disabled={this.props.readonly}
                    onDrop={(data: any) => {
                        this.onDrop(data, this.props.field.width, this.props.field.height, this.props.field.contentType)
                    }} multiple={true}>
                    <div style={{ textAlign: "left", color: "#E2356F" }}>Upload {this.props.field.title}</div>
                    {this.state.inProgress &&
                        <img src="./images/loadingGif.gif" style={{ width: "112px", textAlign: "center" }} />}
                    {this.props.currentModel &&
                            <div style={{ cursor: "pointer" }} onClick={this.handleImageClick}>
                                {this.previewUpload()}
                            </div>
                    }
                </Dropzone>
                {this.props.currentModel &&
                    <a onClick={this.removeFile} style={{ color: "#0000EE" }}>Remove</a>}
            </div>
        )
    }

    getUrl(url: string, field: any) {
        return (field.urlPrefix ? field.urlPrefix : "") + url + (field.urlSuffix ? field.urlSuffix : "")
    }

    handleImageClick(event: any) {
        event.stopPropagation()
        window.open(this.getUrl(this.props.currentModel, this.props.field))
    }
}
