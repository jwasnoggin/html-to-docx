import { VNode } from 'virtual-dom';
import { fragment } from 'xmlbuilder2';
import namespaces from '../namespaces';
import { vNodeHasChildren } from '../utils/vnode';
import { buildTableGridCol } from './buildTableGridCol';

export function buildTableGridFromTableRow(vNode: VNode, attributes) {
  const tableGridFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'tblGrid');
  if (vNodeHasChildren(vNode)) {
    const numberOfGridColumns = vNode.children.reduce((accumulator, childVNode: VNode) => {
      const colSpan = childVNode.properties.colSpan || childVNode.properties.style?.['column-span'];

      return accumulator + (colSpan ? parseInt(colSpan) : 1);
    }, 0);
    const gridWidth = Math.floor(attributes.maximumWidth / numberOfGridColumns);

    for (let index = 0; index < numberOfGridColumns; index++) {
      const tableGridColFragment = buildTableGridCol(gridWidth);
      tableGridFragment.import(tableGridColFragment);
    }
  }
  tableGridFragment.up();

  return tableGridFragment;
}
