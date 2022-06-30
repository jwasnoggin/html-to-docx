import JSZip from 'jszip';
import DocxDocument from './docx-document';
declare function addFilesToContainer(zip: JSZip, htmlString: string, suppliedDocumentOptions: any, headerHTMLString: string, footerHTMLString: string): JSZip;
export declare function addRelsToZip(zip: JSZip, docxDocument: DocxDocument): void;
export default addFilesToContainer;
