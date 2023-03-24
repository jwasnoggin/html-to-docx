import { fragment } from 'xmlbuilder2';
import namespaces from '../namespaces';

export function buildShading(colorCode: string) {
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'shd')
    .att('@w', 'val', 'clear')
    .att('@w', 'fill', colorCode)
    .up();
}
