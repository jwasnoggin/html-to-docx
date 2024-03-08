import { DocumentOptions } from './types';
/* eslint-disable no-useless-escape */
import JSZip from 'jszip';
import addFilesToContainer, { addRelsToZip } from './html-to-docx';
import DocxDocument from './docx-document';
import { renderDocumentFile } from './helpers';
import { defaultDocumentOptions } from './constants';

const minifyHTMLString = (htmlString: string) => {
  try {
    if (typeof htmlString === 'string') {
      const minifiedHTMLString = htmlString
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\r\n/g, ' ')
        .replace(/[\t ]+</g, ' <')
        .replace(/>[\t ]+$/g, '> ')
        .replace(/>[\t ]+</g, '> <')
        .replace(/\s{2,}\B/g, '');
      return minifiedHTMLString;
    }

    throw new Error('invalid html string');
  } catch (error) {
    return null;
  }
};

export async function generateContainer(
  htmlString: string,
  headerHTMLString: string,
  documentOptions: DocumentOptions = {},
  footerHTMLString: string = ''
) {
  const zip = new JSZip();

  let contentHTML = htmlString;
  let headerHTML = headerHTMLString;
  let footerHTML = footerHTMLString;
  if (htmlString) {
    contentHTML = minifyHTMLString(contentHTML);
  }
  if (headerHTMLString) {
    headerHTML = minifyHTMLString(headerHTML);
  }
  if (footerHTMLString) {
    footerHTML = minifyHTMLString(footerHTML);
  }

  addFilesToContainer(zip, contentHTML, documentOptions, headerHTML, footerHTML);

  const buffer = await zip.generateAsync({ type: 'arraybuffer' });
  if (Object.prototype.hasOwnProperty.call(global, 'Blob')) {
    // eslint-disable-next-line no-undef
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }
  if (Object.prototype.hasOwnProperty.call(global, 'Buffer')) {
    return Buffer.from(new Uint8Array(buffer));
  }
  throw new Error(
    'Add blob support using a polyfill eg https://github.com/bjornstar/blob-polyfill'
  );
}

/**
 * Convert a HTML snippet into the corresponding XML snippet
 * @param htmlString String to convert
 * @param options Options to provide to the converted document (eg width, margins - useful for tables)
 * @returns xmlString: XML snippet (no document or body tag)
 *
 * zip: The generated docx file (including media files)
 */
export function convertSnippetToXML(
  htmlString: string,
  options: DocumentOptions = {}
): { xmlString: string; zip: JSZip } {
  const zip = new JSZip();
  const docxDocument = new DocxDocument({ htmlString, zip, ...defaultDocumentOptions, ...options });
  // Conversion to Word XML happens here
  docxDocument.documentXML = renderDocumentFile(docxDocument);
  const docXML = docxDocument.generateDocumentXML(false, false);

  addRelsToZip(zip, docxDocument);
  zip.folder('word')
    .file('styles.xml', docxDocument.generateStylesXML(), { createFolders: false })
    .file('numbering.xml', docxDocument.generateNumberingXML(), { createFolders: false })

  return {
    // If we extract the nodes inside the body, they lose their prefixes for some reason. So just do string manipulation to remove the document and body tags.
    xmlString: docXML
      .toString()
      .replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '')
      .replace(/(<w:document.*?>)/, '')
      .replace(/<\/w:document>/, '')
      .replace(/(<w:body.*?>)/, '')
      .replace(/<\/w:body>/, ''),
    zip: docxDocument.zip,
  };
}
