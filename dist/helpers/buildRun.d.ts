/// <reference types="virtual-dom" />
import { RunAttributes } from './buildRunProperties';
import DocxDocument from 'docx-document';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
export declare function buildRun(vNode: VirtualDOM.VNode | VirtualDOM.VTree, attributes: RunAttributes, docxDocumentInstance?: DocxDocument): XMLBuilder;
export declare function vNodeStylesToRunAttributes(vNode: VirtualDOM.VNode): RunAttributes;
