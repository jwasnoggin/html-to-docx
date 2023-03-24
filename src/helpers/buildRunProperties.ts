import { fragment } from 'xmlbuilder2';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import namespaces from '../namespaces';
import { buildTextFormatting } from './buildTextFormatting';

export type RunAttributes = {
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

export function buildRunProperties(attributes: RunAttributes): XMLBuilder {
  const runPropertiesFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'rPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      const prop = buildTextFormatting(key, attributes[key]);
      if (prop) runPropertiesFragment.import(prop);
    });
  }
  runPropertiesFragment.up();

  return runPropertiesFragment;
}
