import { fragment } from 'xmlbuilder2';
import cloneDeep from 'lodash-es/cloneDeep';
import namespaces from '../namespaces';
import { paragraphBordersObject } from '../constants';
import { buildBorder } from './buildBorder';
import { BorderAttributes } from './buildParagraph';

export function buildParagraphBorder(bordersObject?: BorderAttributes) {
  const paragraphBorderFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'pBdr'
  );

  if (!bordersObject) {
    bordersObject = cloneDeep(paragraphBordersObject);
  }

  Object.keys(bordersObject).forEach((borderName) => {
    if (bordersObject[borderName]) {
      const { size, spacing, color } = bordersObject[borderName];

      const borderFragment = buildBorder(borderName, size, spacing, color);
      paragraphBorderFragment.import(borderFragment);
    }
  });

  paragraphBorderFragment.up();

  return paragraphBorderFragment;
}
