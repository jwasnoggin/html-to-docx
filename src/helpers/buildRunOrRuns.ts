import { RunAttributes } from './buildRunProperties';
import isVNode from 'virtual-dom/vnode/is-vnode';
import { buildRun, vNodeStylesToRunAttributes } from './buildRun';
import DocxDocument from 'docx-document';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

export function buildRunOrRuns(
  vNode: VirtualDOM.VTree,
  attributes: RunAttributes,
  docxDocumentInstance?: DocxDocument
) {
  if (isVNode(vNode) && vNode.tagName === 'span') {
    const runFragments: XMLBuilder[] = [];

    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];

      const modifiedAttributes = Object.assign({}, attributes, vNodeStylesToRunAttributes(vNode));

      runFragments.push(buildRun(childVNode, modifiedAttributes, docxDocumentInstance));
    }

    return runFragments;
  } else {
    const runFragment = buildRun(vNode, attributes, docxDocumentInstance);

    return runFragment;
  }
}
