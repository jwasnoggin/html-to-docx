import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
export declare type RunAttributes = {
    [x: string]: string | number | any;
    constructor?: any;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    font?: string;
    i?: any;
    u?: any;
    strong?: any;
};
export declare function buildRunProperties(attributes: RunAttributes): XMLBuilder;
