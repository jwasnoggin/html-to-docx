import { defaultDocumentOptions } from './constants';
export declare type HeaderFooterType = 'default' | 'first' | 'even';
export declare type Orientation = 'portrait' | 'landscape';
export declare type Margins = {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    header?: number;
    footer?: number;
    gutter?: number;
};
export declare type DocumentOptions = Partial<typeof defaultDocumentOptions> & {
    width?: number;
    height?: number;
};
