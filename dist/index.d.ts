/// <reference types="node" />
import { DocumentOptions } from './types';
export declare function generateContainer(htmlString: any, headerHTMLString: any, documentOptions: DocumentOptions, footerHTMLString: any): Promise<Buffer | Blob>;
/**
 * Convert a HTML snippet into the corresponding XML snippet
 * @param htmlString
 * @returns XML (no document or body tag)
 */
export declare function convertSnippetToXML(htmlString: string): string;
