export declare type TableBorders = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    stroke?: string;
    color?: string;
    insideV?: number;
    insideH?: number;
};
export declare type TableCellBorders = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};
export declare function buildTable(vNode: any, attributes: any, docxDocumentInstance: any): import("xmlbuilder2/lib/interfaces").XMLBuilder;
