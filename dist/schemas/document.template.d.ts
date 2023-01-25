import { Margins, Orientation } from 'types';
declare const generateDocumentTemplate: (width: number, height: number, orientation: Orientation, margins: Margins, includeSectPr?: boolean) => string;
export default generateDocumentTemplate;
