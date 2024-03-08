/// <reference types="virtual-dom" />
import DocxDocument from 'docx-document';
import { RunAttributes } from './buildRunProperties';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
declare type NumberingAttributes = {
    levelId: any;
    numberingId: any;
};
export declare type BorderAttributes = Record<'top' | 'bottom' | 'left' | 'right', {
    size: number;
    spacing: number;
    color: string;
    stroke?: string;
}>;
export declare type ParagraphAttributes = {
    color?: string;
    backgroundColor?: string;
    verticalAlign?: any;
    textAlign?: any;
    strong?: any;
    fontSize?: any;
    lineHeight?: string;
    beforeSpacing?: string;
    afterSpacing?: string;
    indentation?: any;
    display?: any;
    highlightColor?: any;
    font?: string;
    paragraphStyle?: string;
    numbering?: NumberingAttributes;
    border?: BorderAttributes;
};
export declare function buildParagraph(vNode: VirtualDOM.VNode | VirtualDOM.VTree, attributes: ParagraphAttributes | RunAttributes, docxDocumentInstance: DocxDocument): XMLBuilder;
export {};