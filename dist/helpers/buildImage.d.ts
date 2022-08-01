/// <reference types="virtual-dom" />
import DocxDocument from 'docx-document';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { RunAttributes } from './buildRunProperties';
export declare function buildImage(docxDocumentInstance: DocxDocument, vNode: VirtualDOM.VNode | VirtualDOM.VTree, maximumWidth?: number | null): XMLBuilder | undefined;
export declare function getPictureAttributes(docxDocumentInstance: DocxDocument, vNode: VirtualDOM.VNode | VirtualDOM.VTree, maximumWidth?: number | null): RunAttributes | undefined;
