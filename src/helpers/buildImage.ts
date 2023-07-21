import sizeOf from 'image-size';
import { buildParagraph } from './buildParagraph';
import { imageType, internalRelationship } from '../constants';
import DocxDocument from 'docx-document';
import { get } from 'lodash-es';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { RunAttributes } from './buildRunProperties';

export function buildImage(
  docxDocumentInstance: DocxDocument,
  vNode: VirtualDOM.VNode | VirtualDOM.VTree,
  maximumWidth: number | null = null
): XMLBuilder | undefined {
  const attrs = getPictureAttributes(docxDocumentInstance, vNode, maximumWidth);
  if (attrs) {
    const imageFragment = buildParagraph(vNode, attrs, docxDocumentInstance);
    return imageFragment;
  }
}

export function getPictureAttributes(
  docxDocumentInstance: DocxDocument,
  vNode: VirtualDOM.VNode | VirtualDOM.VTree,
  maximumWidth: number | null = null
): RunAttributes | undefined {
  let response: { id: number; fileContent: string; fileNameWithExtension: string } | null = null;
  try {
    try {
      // libtidy encodes the image src
      const decoded = decodeURIComponent(get(vNode, 'properties.src'));
      response = docxDocumentInstance.createMediaFile(decoded);
    } catch (error) {
      console.warn('error creating media', error);
      // NOOP
    }
    if (response) {
      docxDocumentInstance.zip
        .folder('word')
        .folder('media')
        .file(response.fileNameWithExtension, Buffer.from(response.fileContent, 'base64'), {
          createFolders: false,
        });

      const relationshipId = response.fileNameWithExtension.replace(/[^0-9a-zA-Z]/g, '');

      docxDocumentInstance.createDocumentRelationships(
        docxDocumentInstance.relationshipFilename,
        imageType,
        `media/${response.fileNameWithExtension}`,
        internalRelationship,
        relationshipId
      );

      const imageBuffer = Buffer.from(response.fileContent, 'base64');
      const imageProperties = sizeOf(imageBuffer);

      return {
        type: 'picture',
        inlineOrAnchored: true,
        relationshipId,
        ...response,
        maximumWidth: maximumWidth || docxDocumentInstance.availableDocumentSpace,
        originalWidth: imageProperties.width,
        originalHeight: imageProperties.height,
      };
    }
  } catch (err) {
    console.log('error building image');
  }
}
