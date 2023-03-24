/// <reference types="virtual-dom" />
import { RunAttributes } from './buildRunProperties';
import DocxDocument from 'docx-document';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
export declare function buildRunOrRuns(vNode: VirtualDOM.VTree, attributes: RunAttributes, docxDocumentInstance?: DocxDocument): XMLBuilder | XMLBuilder[];
