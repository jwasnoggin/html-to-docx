import sizeOf from 'image-size';
import { buildParagraph } from './buildParagraph';
import { imageType, internalRelationship } from '../constants';
import DocxDocument from 'docx-document';

export function buildImage(
  docxDocumentInstance: DocxDocument,
  vNode: VirtualDOM.VNode | VirtualDOM.VTree,
  maximumWidth: number | null = null
) {
  let response: { id: number; fileContent: string; fileNameWithExtension: string; } | null = null;
  try {
    console.log('srcStart', ((vNode as any).properties.src as string).substring(0, 100));
    try {
      // libtidy encodes the image src
      const decoded = decodeURIComponent((vNode as any).properties.src);
      console.log('decoded', decoded.substring(0, 100));
      response = docxDocumentInstance.createMediaFile(
        decoded
      );
    } catch (error) {
      // NOOP
    }
    if (response) {
      docxDocumentInstance.zip
        .folder('word')
        .folder('media')
        .file(response.fileNameWithExtension, Buffer.from(response.fileContent, 'base64'), {
          createFolders: false,
        });

      const documentRelsId = docxDocumentInstance.createDocumentRelationships(
        docxDocumentInstance.relationshipFilename,
        imageType,
        `media/${response.fileNameWithExtension}`,
        internalRelationship
      );

      const imageBuffer = Buffer.from(response.fileContent, 'base64');
      const imageProperties = sizeOf(imageBuffer);

      const imageFragment = buildParagraph(
        vNode,
        {
          type: 'picture',
          inlineOrAnchored: true,
          relationshipId: documentRelsId,
          ...response,
          maximumWidth: maximumWidth || docxDocumentInstance.availableDocumentSpace,
          originalWidth: imageProperties.width,
          originalHeight: imageProperties.height,
        },
        docxDocumentInstance
      );

      return imageFragment;
    }
  } catch (err) {
    console.log('error building image');
  }
}
