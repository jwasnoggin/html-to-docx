export declare type PictureAttributes = {
    id: any;
    fileNameWithExtension: any;
    description: any;
    relationshipId: any;
    width: any;
    height: any;
};
export declare function buildPicture({ id, fileNameWithExtension, description, relationshipId, width, height, }: PictureAttributes): import("xmlbuilder2/lib/interfaces").XMLBuilder;
