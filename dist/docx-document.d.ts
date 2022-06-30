import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import JSZip from 'jszip';
export declare type SectionXMLResponse = SectionXMLHeader | SectionXMLFooter;
export declare type SectionType = 'header' | 'footer';
export declare type SectionXMLHeader = {
    type: 'header';
    headerId: string;
    headerXML: XMLBuilder;
};
export declare type SectionXMLFooter = {
    type: 'footer';
    footerId: string;
    footerXML: XMLBuilder;
};
declare type LineNumberOptions = {
    countBy?: number;
    start?: number;
    restart?: string;
};
declare type NumberObjectPropertiesProperties = {
    attributes: unknown[];
    style: string;
};
declare type NumberObjectProperties = {
    numberingId: number;
    type: string;
    properties?: NumberObjectPropertiesProperties;
};
declare type GenerateSectionXMLFunction = (vTree: unknown, section: SectionType) => SectionXMLResponse;
declare type Margins = {
    left?: number;
    right?: number;
};
declare type FooterType = 'default' | 'first' | 'even';
declare type Orientation = 'portrait' | 'landscape';
declare type HeaderType = 'default' | 'first' | 'even';
declare class DocxDocument {
    zip: JSZip;
    htmlString: string;
    orientation: Orientation;
    width: number;
    height: number;
    margins: Margins;
    availableDocumentSpace: number;
    title?: string;
    subject?: string;
    creator?: string;
    keywords: string[];
    description?: string;
    lastModifiedBy?: string;
    revision?: number;
    createdAt?: Date;
    modifiedAt?: Date;
    headerType?: HeaderType;
    header?: boolean;
    footerType?: FooterType;
    footer?: boolean;
    font?: string;
    fontSize?: number;
    complexScriptFontSize?: number;
    tableRowCantSplit?: boolean;
    pageNumber?: boolean;
    skipFirstHeaderFooter?: boolean;
    lineNumber?: LineNumberOptions;
    lastNumberingId: number;
    lastMediaId: number;
    lastHeaderId: number;
    lastFooterId: number;
    stylesObjects: unknown[];
    numberingObjects: NumberObjectProperties[];
    relationshipFilename: string;
    relationships: {
        fileName: string;
        lastRelsId: number;
        rels: unknown[];
    }[];
    mediaFiles: unknown[];
    headerObjects: unknown[];
    footerObjects: unknown[];
    documentXML: XMLBuilder;
    generateSectionXML: GenerateSectionXMLFunction;
    constructor(properties: any);
    generateContentTypesXML(): string;
    generateDocumentXML(returnString: false): XMLBuilder;
    generateDocumentXML(returnString?: true): string;
    generateCoreXML(): string;
    generateSettingsXML(): string;
    generateWebSettingsXML(): string;
    generateStylesXML(): string;
    generateFontTableXML(): string;
    generateThemeXML(): string;
    generateNumberingXML(): string;
    appendRelationships(xmlFragment: any, relationships: any): void;
    generateRelsXML(): {
        fileName: string;
        xmlString: string;
    }[];
    createNumbering(type: any, properties: any): number;
    createMediaFile(base64String: string): {
        id: number;
        fileContent: string;
        fileNameWithExtension: string;
    };
    createDocumentRelationships(fileName: string, type: any, target: any, targetMode?: string): number;
    generateHeaderXML(vTree: any): SectionXMLHeader;
    generateFooterXML(vTree: any): SectionXMLFooter;
}
export default DocxDocument;
