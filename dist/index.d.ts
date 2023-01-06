/// <reference types="node" />
import { DocumentOptions } from './types';
import JSZip from 'jszip';
export declare function generateContainer(htmlString: string, headerHTMLString: string, documentOptions?: DocumentOptions, footerHTMLString?: string): Promise<Buffer | Blob>;
/**
 * Convert a HTML snippet into the corresponding XML snippet
 * @param htmlString String to convert
 * @param options Options to provide to the converted document (eg width, margins - useful for tables)
 * @returns xmlString: XML snippet (no document or body tag)
 *
 * zip: The generated docx file (including media files)
 */
export declare function convertSnippetToXML(htmlString: string, options?: DocumentOptions): {
    xmlString: string;
    zip: JSZip;
};
