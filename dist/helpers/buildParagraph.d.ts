/// <reference types="virtual-dom" />
import DocxDocument from 'docx-document';
import { RunAttributes } from './buildRunProperties';
declare type NumberingAttributes = {
    levelId: any;
    numberingId: any;
};
export declare type ParagraphAttributes = {
    color?: string;
    backgroundColor?: string;
    verticalAlign?: any;
    textAlign?: any;
    strong?: any;
    fontSize?: any;
    lineHeight?: any;
    indentation?: any;
    display?: any;
    highlightColor?: any;
    font?: string;
    paragraphStyle?: string;
    numbering?: NumberingAttributes;
};
export declare function buildParagraph(vNode: VirtualDOM.VNode | VirtualDOM.VTree, attributes: ParagraphAttributes | RunAttributes, docxDocumentInstance: DocxDocument): import("xmlbuilder2/lib/interfaces").XMLBuilder;
export {};
