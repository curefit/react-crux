import autobind from "autobind-decorator"
import * as React from "react"
import { Item } from "react-bootstrap/lib/Carousel";

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
    render() {
        return <div className="pull-right" style={{marginBottom : 10}}>
        <button style={{ marginRight: 10 }} 
            className="btn btn-default btn-xs"
            disabled={this.isPrevDisabled()}
            onClick={this.props.prev}>Prev</button>
        <span className=" heading" style={{ marginLeft: 10, marginRight: 20 }}>{this.getPageNumber()}</span>
        <button style={{ marginRight: 10 }} 
            className=" btn btn-default btn-xs"
            disabled={this.isNextDisabled()}
            onClick={this.props.next}>Next</button>
        <span className="heading" style={{marginRight: 10}}>Page Size: </span>
        {this.props.dataconstant.allowedPageSizes.map((paginateSize: number) => {
            let buttonClass = "btn btn-default btn-xs"
            if(this.props.item.paginate.currentPageSize === paginateSize){
                buttonClass = "btn btn-primary btn-xs"
            }
            return (
                <button style={{ marginRight: 10 }} 
                    className={buttonClass}
                    onClick={this.props.paginate.bind(this, paginateSize)}>{paginateSize}</button>
            )
        })}
    </div>
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
