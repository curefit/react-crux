import autobind from "autobind-decorator"
import * as React from "react"
import { SelectComponent } from "./SelectComponent"


interface PaginationComponentProps {
    prev: any,
    next: any,
    paginate: any,
    metadata: any,
    dataconstant: any,
    item: any
}

@autobind
export class PaginationComponent extends React.Component<PaginationComponentProps, any> {

    pageSelectField = {
        style: {
            hideLabel: true
        },
        foreign : {
            modelName: "pageSizes",
            key: "typeId",
            title: "title",
        }
    }

    render() {
        return <div className="pull-right" style={{ marginBottom: 10 }}>
            <button style={{ marginRight: 10 }}
                className="btn btn-default btn-xs"
                disabled={this.isPrevDisabled()}
                onClick={this.props.prev}>Prev</button>
            <span className=" heading" style={{ marginLeft: 10, marginRight: 20 }}>{this.getPageNumber()}</span>
            <button style={{ marginRight: 10 }}
                className=" btn btn-default btn-xs"
                disabled={this.isNextDisabled()}
                onClick={this.props.next}>Next</button>
            <span className="heading" style={{ marginRight: 10 }}>Page Size: </span>
            <span style={{ display: "inline-block", marginRight: 5 }}>
                <SelectComponent field={this.pageSelectField}
                    readonly={false}
                    additionalModels={{pageSizes : this.getPageSizes()}}
                    modelChanged={this.handlePageSelect}
                    currentModel={this.props.item.paginate.currentPageSize.toString()}
                    showTitle={false}
                    parentModel=""
                />
            </span>
        </div>
    }

    getPageSizes() {
        return this.props.dataconstant.allowedPageSizes.map((pageSize: number) => {
            return {
                typeId: pageSize.toString(),
                title: pageSize
            }
        })
    }

    handlePageSelect(field: any, pageSize: string) {
        this.props.paginate(Number(pageSize))
    }

    isNextDisabled() {
        return Math.ceil(this.props.metadata.totalCount / this.props.item.paginate.currentPageSize) - this.props.item.paginate.currentPage === 0
    }

    isPrevDisabled() {
        return this.props.item.paginate.currentPage === 1
    }

    getPageNumber() {
        return `Page: ${this.props.item.paginate.currentPage} / ${Math.ceil(this.props.metadata.totalCount / this.props.item.paginate.currentPageSize)}`
    }
}
