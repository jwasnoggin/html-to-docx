import { ExtentProps } from './buildExtents';
import { fragment } from 'xmlbuilder2';
import namespaces from '../namespaces';

export function buildExtent({ width, height }: ExtentProps) {
  return fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'extent')
    .att('cx', width)
    .att('cy', height)
    .up();
}