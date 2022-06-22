/// <reference types="virtual-dom" />
import DocxDocument from 'docx-document';
export declare function buildTableCell(vNode: VirtualDOM.VNode, attributes: any, rowSpanMap: any, columnIndex: any, docxDocumentInstance: DocxDocument): import("xmlbuilder2/lib/interfaces").XMLBuilder;
export declare const fixupTableCellBorder: (vNode: VirtualDOM.VNode, attributes: any) => void;
