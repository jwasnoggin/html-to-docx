/// <reference types="virtual-dom" />
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import DocxDocument from 'docx-document';
export declare function convertVTreeToXML(docxDocumentInstance: DocxDocument, vTree: VirtualDOM.VNode | VirtualDOM.VTree | VirtualDOM.VTree[], xmlFragment: XMLBuilder): XMLBuilder;
declare function renderDocumentFile(docxDocumentInstance: DocxDocument): XMLBuilder;
export default renderDocumentFile;
