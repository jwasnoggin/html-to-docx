import { defaultDocumentOptions } from './constants';

export type HeaderFooterType = 'default' | 'first' | 'even';
export type Orientation = 'portrait' | 'landscape';

export type Margins = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  header?: number;
  footer?: number;
  gutter?: number;
};

export type DocumentOptions = Partial<typeof defaultDocumentOptions> & {
  width?: number;
  height?: number;
};
