import { fragment } from 'xmlbuilder2';
import namespaces from '../namespaces';
import {
  buildBold,
  buildItalics,
  buildUnderline,
  buildColor,
  buildFontSize,
  buildRunStyleFragment,
  buildHighlight,
  buildRunFontFragment,
} from './buildFragments';
import { buildShading } from './buildShading';

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

export function buildRunProperties(attributes: RunAttributes) {
  const runPropertiesFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'rPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'strong':
          runPropertiesFragment.import(buildBold());
          break;
        case 'i':
          runPropertiesFragment.import(buildItalics());
          break;
        case 'u':
          runPropertiesFragment.import(buildUnderline());
          break;
        case 'color':
          if (attributes[key]) runPropertiesFragment.import(buildColor(attributes[key]));
          break;
        case 'backgroundColor':
          if (attributes[key]) runPropertiesFragment.import(buildShading(attributes[key]));
          break;
        case 'fontSize':
          if (attributes[key]) runPropertiesFragment.import(buildFontSize(attributes[key]));
          break;
        case 'hyperlink':
          runPropertiesFragment.import(buildRunStyleFragment('Hyperlink'));
          break;
        case 'highlightColor':
          runPropertiesFragment.import(buildHighlight(attributes[key]));
          break;
        case 'font':
          runPropertiesFragment.import(buildRunFontFragment('Courier'));
          break;
      }
    });
  }
  runPropertiesFragment.up();

  return runPropertiesFragment;
}
