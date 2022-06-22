declare const getListStyleType: (listType: any) => "upperRoman" | "lowerRoman" | "upperLetter" | "lowerLetter" | "decimal";
declare const getListPrefixSuffix: (style: any, lvl: any) => string;
export { getListStyleType, getListPrefixSuffix };
