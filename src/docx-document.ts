import { create, fragment } from 'xmlbuilder2';
import { nanoid } from 'nanoid';
import { Element } from '@oozcitak/dom/lib/dom/interfaces';

import {
  generateCoreXML,
  generateStylesXML,
  generateNumberingXMLTemplate,
  generateThemeXML,
  documentRelsXML as documentRelsXMLString,
  settingsXML as settingsXMLString,
  webSettingsXML as webSettingsXMLString,
  contentTypesXML as contentTypesXMLString,
  fontTableXML as fontTableXMLString,
  genericRelsXML as genericRelsXMLString,
  generateDocumentTemplate,
} from './schemas';
import { convertVTreeToXML } from './helpers';
import namespaces from './namespaces';
import {
  footerType as footerFileType,
  headerType as headerFileType,
  themeType as themeFileType,
  landscapeMargins,
  portraitMargins,
  defaultOrientation,
  landscapeWidth,
  landscapeHeight,
  applicationName,
  defaultFont,
  defaultFontSize,
  hyperlinkType,
  documentFileName,
  imageType,
} from './constants';
import { getListStyleType, getListPrefixSuffix } from './utils/list';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import JSZip from 'jszip';

export type SectionXMLResponse = SectionXMLHeader | SectionXMLFooter;

export type SectionType = 'header' | 'footer';

export type SectionXMLHeader = {
  type: 'header';
  headerId: string;
  headerXML: XMLBuilder;
};

export type SectionXMLFooter = {
  type: 'footer';
  footerId: string;
  footerXML: XMLBuilder;
};

function generateContentTypesFragments(contentTypesXML, type, objects) {
  if (objects && Array.isArray(objects)) {
    objects.forEach((object) => {
      const contentTypesFragment = fragment({ defaultNamespace: { ele: namespaces.contentTypes } })
        .ele('Override')
        .att('PartName', `/word/${type}${object[`${type}Id`]}.xml`)
        .att(
          'ContentType',
          `application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml`
        )
        .up();

      contentTypesXML.root().import(contentTypesFragment);
    });
  }
}

function generateSectionReferenceXML(documentXML, documentSectionType, objects, isEnabled) {
  if (isEnabled && objects && Array.isArray(objects) && objects.length) {
    const xmlFragment = fragment();
    objects.forEach(({ relationshipId, type }) => {
      const objectFragment = fragment({ namespaceAlias: { w: namespaces.w, r: namespaces.r } })
        .ele('@w', `${documentSectionType}Reference`)
        .att('@r', 'id', `rId${relationshipId}`)
        .att('@w', 'type', type)
        .up();
      xmlFragment.import(objectFragment);
    });

    documentXML.root().first().first().import(xmlFragment);
  }
}

function generateXMLString(xmlString) {
  const xmlDocumentString = create({ encoding: 'UTF-8', standalone: true }, xmlString);
  return xmlDocumentString.toString({ prettyPrint: true });
}

function generateSectionXML(vTree, type: SectionType = 'header'): SectionXMLResponse {
  const sectionXML = create({
    encoding: 'UTF-8',
    standalone: true,
    namespaceAlias: {
      w: namespaces.w,
      ve: namespaces.ve,
      o: namespaces.o,
      r: namespaces.r,
      v: namespaces.v,
      wp: namespaces.wp,
      w10: namespaces.w10,
    },
  }).ele('@w', type === 'header' ? 'hdr' : 'ftr');

  const XMLFragment = fragment();
  convertVTreeToXML(this, vTree, XMLFragment);
  if (
    type === 'footer' &&
    (XMLFragment.first().node as Element).tagName === 'p' &&
    this.pageNumber
  ) {
    XMLFragment.first().import(
      fragment({ namespaceAlias: { w: namespaces.w } })
        .ele('@w', 'fldSimple')
        .att('@w', 'instr', 'PAGE')
        .ele('@w', 'r')
        .up()
        .up()
    );
  }
  sectionXML.root().import(XMLFragment);

  const referenceName = type === 'header' ? 'Header' : 'Footer';
  this[`last${referenceName}Id`] += 1;

  switch (type) {
    case 'header':
      return { type: 'header', headerId: this[`last${referenceName}Id`], headerXML: sectionXML };
    case 'footer':
      return { type: 'footer', footerId: this[`last${referenceName}Id`], footerXML: sectionXML };
    default:
      throw new Error('invalid type, must be footer | header');
  }
}

type LineNumberOptions = {
  countBy?: number;
  start?: number;
  restart?: string;
};

type NumberObjectPropertiesProperties = {
  attributes: unknown[];
  style: string;
};

type NumberObjectProperties = {
  numberingId: number;
  type: string;
  properties?: NumberObjectPropertiesProperties;
};

type GenerateSectionXMLFunction = (vTree: unknown, section: SectionType) => SectionXMLResponse;

type Margins = {
  left?: number;
  right?: number;
};

type FooterType = 'default' | 'first' | 'even';

type Orientation = 'portrait' | 'landscape';

type HeaderType = 'default' | 'first' | 'even';

type Relationship = {
  fileName: string;
  lastRelsId: number;
  rels: {
    relationshipId: number | string;
    type: string;
    target: string;
    targetMode: string;
  }[];
};

class DocxDocument {
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
  relationships: Relationship[];
  mediaFiles: unknown[];
  headerObjects: unknown[];
  footerObjects: unknown[];
  documentXML: XMLBuilder;
  generateSectionXML: GenerateSectionXMLFunction;

  constructor(properties) {
    this.zip = properties.zip;
    this.htmlString = properties.htmlString;
    this.orientation = properties.orientation;

    const isPortraitOrientation = this.orientation === defaultOrientation;
    this.width = isPortraitOrientation ? landscapeHeight : landscapeWidth;
    this.height = isPortraitOrientation ? landscapeWidth : landscapeHeight;

    const marginsObject = properties.margins;
    this.margins =
      // eslint-disable-next-line no-nested-ternary
      marginsObject && Object.keys(marginsObject).length
        ? marginsObject
        : isPortraitOrientation
        ? portraitMargins
        : landscapeMargins;

    this.availableDocumentSpace = this.width - this.margins.left - this.margins.right;
    this.title = properties.title || '';
    this.subject = properties.subject || '';
    this.creator = properties.creator || applicationName;
    this.keywords = properties.keywords || [applicationName];
    this.description = properties.description || '';
    this.lastModifiedBy = properties.lastModifiedBy || applicationName;
    this.revision = properties.revision || 1;
    this.createdAt = properties.createdAt || new Date();
    this.modifiedAt = properties.modifiedAt || new Date();
    this.headerType = properties.headerType || 'default';
    this.header = properties.header || false;
    this.footerType = properties.footerType || 'default';
    this.footer = properties.footer || false;
    this.font = properties.font || defaultFont;
    this.fontSize = properties.fontSize || defaultFontSize;
    this.complexScriptFontSize = properties.complexScriptFontSize || defaultFontSize;
    this.tableRowCantSplit =
      (properties.table && properties.table.row && properties.table.row.cantSplit) || false;
    this.pageNumber = properties.pageNumber || false;
    this.skipFirstHeaderFooter = properties.skipFirstHeaderFooter || false;
    this.lineNumber = properties.lineNumber ? properties.lineNumberOptions : null;

    this.lastNumberingId = 0;
    this.lastMediaId = 0;
    this.lastHeaderId = 0;
    this.lastFooterId = 0;
    this.stylesObjects = [];
    this.numberingObjects = [];
    this.relationshipFilename = documentFileName;
    this.relationships = [{ fileName: documentFileName, lastRelsId: 4, rels: [] }];
    this.mediaFiles = [];
    this.headerObjects = [];
    this.footerObjects = [];
    this.documentXML = null;

    this.generateContentTypesXML = this.generateContentTypesXML.bind(this);
    this.generateDocumentXML = this.generateDocumentXML.bind(this);
    this.generateCoreXML = this.generateCoreXML.bind(this);
    this.generateSettingsXML = this.generateSettingsXML.bind(this);
    this.generateWebSettingsXML = this.generateWebSettingsXML.bind(this);
    this.generateStylesXML = this.generateStylesXML.bind(this);
    this.generateFontTableXML = this.generateFontTableXML.bind(this);
    this.generateThemeXML = this.generateThemeXML.bind(this);
    this.generateNumberingXML = this.generateNumberingXML.bind(this);
    this.generateRelsXML = this.generateRelsXML.bind(this);
    this.createMediaFile = this.createMediaFile.bind(this);
    this.createDocumentRelationships = this.createDocumentRelationships.bind(this);
    this.generateHeaderXML = this.generateHeaderXML.bind(this);
    this.generateFooterXML = this.generateFooterXML.bind(this);
    this.generateSectionXML = generateSectionXML.bind(this);
  }

  generateContentTypesXML() {
    const contentTypesXML = create({ encoding: 'UTF-8', standalone: true }, contentTypesXMLString);

    generateContentTypesFragments(contentTypesXML, 'header', this.headerObjects);
    generateContentTypesFragments(contentTypesXML, 'footer', this.footerObjects);

    return contentTypesXML.toString({ prettyPrint: true });
  }

  generateDocumentXML(returnString: false): XMLBuilder;
  generateDocumentXML(returnString?: true): string;
  generateDocumentXML(returnString = true) {
    const documentXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateDocumentTemplate(this.width, this.height, this.orientation, this.margins)
    );
    documentXML.root().first().import(this.documentXML);

    generateSectionReferenceXML(documentXML, 'header', this.headerObjects, this.header);
    generateSectionReferenceXML(documentXML, 'footer', this.footerObjects, this.footer);

    if ((this.header || this.footer) && this.skipFirstHeaderFooter) {
      documentXML
        .root()
        .first()
        .first()
        .import(fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'titlePg'));
    }
    if (this.lineNumber) {
      const { countBy, start, restart } = this.lineNumber;
      documentXML
        .root()
        .first()
        .first()
        .import(
          fragment({ namespaceAlias: { w: namespaces.w } })
            .ele('@w', 'lnNumType')
            .att('@w', 'countBy', countBy.toString())
            .att('@w', 'start', start.toString())
            .att('@w', 'restart', restart)
        );
    }
    if (returnString) {
      return documentXML.toString({ prettyPrint: true });
    }
    return documentXML;
  }

  generateCoreXML() {
    return generateXMLString(
      generateCoreXML(
        this.title,
        this.subject,
        this.creator,
        this.keywords,
        this.description,
        this.lastModifiedBy,
        this.revision,
        this.createdAt,
        this.modifiedAt
      )
    );
  }

  // eslint-disable-next-line class-methods-use-this
  generateSettingsXML() {
    return generateXMLString(settingsXMLString);
  }

  // eslint-disable-next-line class-methods-use-this
  generateWebSettingsXML() {
    return generateXMLString(webSettingsXMLString);
  }

  generateStylesXML() {
    return generateXMLString(
      generateStylesXML(this.font, this.fontSize, this.complexScriptFontSize)
    );
  }

  // eslint-disable-next-line class-methods-use-this
  generateFontTableXML() {
    return generateXMLString(fontTableXMLString);
  }

  generateThemeXML() {
    return generateXMLString(generateThemeXML(this.font));
  }

  generateNumberingXML() {
    const numberingXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateNumberingXMLTemplate()
    );

    const abstractNumberingFragments = fragment();
    const numberingFragments = fragment();

    this.numberingObjects.forEach(({ numberingId, type, properties }) => {
      const abstractNumberingFragment = fragment({ namespaceAlias: { w: namespaces.w } })
        .ele('@w', 'abstractNum')
        .att('@w', 'abstractNumId', String(numberingId));

      [...Array(8).keys()].forEach((level) => {
        const levelFragment = fragment({ namespaceAlias: { w: namespaces.w } })
          .ele('@w', 'lvl')
          .att('@w', 'ilvl', level.toString())
          .ele('@w', 'start')
          .att(
            '@w',
            'val',
            type === 'ol'
              ? (properties.attributes && properties.attributes['data-start']) || 1
              : '1'
          )
          .up()
          .ele('@w', 'numFmt')
          .att(
            '@w',
            'val',
            type === 'ol'
              ? getListStyleType(properties.style && properties.style['list-style-type'])
              : 'bullet'
          )
          .up()
          .ele('@w', 'lvlText')
          .att('@w', 'val', type === 'ol' ? getListPrefixSuffix(properties.style, level) : '')
          .up()
          .ele('@w', 'lvlJc')
          .att('@w', 'val', 'left')
          .up()
          .ele('@w', 'pPr')
          .ele('@w', 'tabs')
          .ele('@w', 'tab')
          .att('@w', 'val', 'num')
          .att('@w', 'pos', ((level + 1) * 720).toString())
          .up()
          .up()
          .ele('@w', 'ind')
          .att('@w', 'left', ((level + 1) * 720).toString())
          .att('@w', 'hanging', '360')
          .up()
          .up()
          .up();

        if (type === 'ul') {
          levelFragment.last().import(
            fragment({ namespaceAlias: { w: namespaces.w } })
              .ele('@w', 'rPr')
              .ele('@w', 'rFonts')
              .att('@w', 'ascii', 'Wingdings')
              .att('@w', 'hAnsi', 'Wingdings')
              .att('@w', 'hint', 'default')
              .up()
              .up()
          );
        }
        abstractNumberingFragment.import(levelFragment);
      });
      abstractNumberingFragment.up();
      abstractNumberingFragments.import(abstractNumberingFragment);

      numberingFragments.import(
        fragment({ namespaceAlias: { w: namespaces.w } })
          .ele('@w', 'num')
          .att('@w', 'numId', String(numberingId))
          .ele('@w', 'abstractNumId')
          .att('@w', 'val', String(numberingId))
          .up()
          .up()
      );
    });

    numberingXML.root().import(abstractNumberingFragments);
    numberingXML.root().import(numberingFragments);

    return numberingXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  appendRelationships(xmlFragment: XMLBuilder, relationships: Relationship['rels']) {
    relationships.forEach(({ relationshipId, type, target, targetMode }) => {
      xmlFragment.import(
        fragment({ defaultNamespace: { ele: namespaces.relationship } })
          .ele('Relationship')
          .att('Id', `rId${relationshipId}`)
          .att('Type', type)
          .att('Target', target)
          .att('TargetMode', targetMode)
          .up()
      );
    });
  }

  generateRelsXML() {
    const relationshipXMLStrings = this.relationships.map(({ fileName, rels }) => {
      const xmlFragment = create(
        { encoding: 'UTF-8', standalone: true },
        fileName === documentFileName ? documentRelsXMLString : genericRelsXMLString
      );
      this.appendRelationships(xmlFragment.root(), rels);

      return { fileName, xmlString: xmlFragment.toString({ prettyPrint: true }) };
    });

    return relationshipXMLStrings;
  }

  createNumbering(type, properties) {
    this.lastNumberingId += 1;
    this.numberingObjects.push({ numberingId: this.lastNumberingId, type, properties });

    return this.lastNumberingId;
  }

  createMediaFile(base64String: string) {
    // eslint-disable-next-line no-useless-escape
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const base64FileContent = matches[2];
    // matches array contains file type in base64 format - image/jpeg and base64 stringified data
    const fileExtension =
      matches[1].match(/\/(.*?)$/)[1] === 'octet-stream' ? 'png' : matches[1].match(/\/(.*?)$/)[1];

    const fileNameWithExtension = `image-${nanoid()}.${fileExtension}`;

    this.lastMediaId += 1;

    return { id: this.lastMediaId, fileContent: base64FileContent, fileNameWithExtension };
  }

  createDocumentRelationships(
    fileName = 'document',
    type: 'header' | 'footer' | 'theme' | 'hyperlink' | 'image',
    target: string,
    targetMode = 'External',
    customRelId?: string | number
  ) {
    let relationshipObject = this.relationships.find(
      (relationship) => relationship.fileName === fileName
    );
    let lastRelsId: number | string = 1;
    if (relationshipObject) {
      lastRelsId = relationshipObject.lastRelsId + 1;
      relationshipObject.lastRelsId = lastRelsId;
    } else {
      relationshipObject = { fileName, lastRelsId, rels: [] };
      this.relationships.push(relationshipObject);
    }

    let relationshipType: string;
    switch (type) {
      case hyperlinkType:
        relationshipType = namespaces.hyperlinks;
        break;
      case imageType:
        relationshipType = namespaces.images;
        break;
      case headerFileType:
        relationshipType = namespaces.headers;
        break;
      case footerFileType:
        relationshipType = namespaces.footers;
        break;
      case themeFileType:
        relationshipType = namespaces.themes;
        break;
    }

    relationshipObject.rels.push({
      relationshipId: customRelId || lastRelsId,
      type: relationshipType,
      target,
      targetMode,
    });

    return lastRelsId;
  }

  generateHeaderXML(vTree): SectionXMLHeader {
    return this.generateSectionXML(vTree, 'header') as SectionXMLHeader;
  }

  generateFooterXML(vTree): SectionXMLFooter {
    return this.generateSectionXML(vTree, 'footer') as SectionXMLFooter;
  }
}

export default DocxDocument;
