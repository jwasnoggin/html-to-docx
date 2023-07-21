import { fragment } from 'xmlbuilder2';
import isVNode from 'virtual-dom/vnode/is-vnode';
import isVText from 'virtual-dom/vnode/is-vtext';
import namespaces from '../namespaces';
import { buildLineBreak } from './buildLineBreak';
import { buildDrawing } from './buildDrawing';
import { buildTextElement } from './buildTextElement';
import { buildTextFormatting } from './buildTextFormatting';
import { buildRunProperties, RunAttributes } from './buildRunProperties';
import VText from 'virtual-dom/vnode/vtext';
import { getPictureAttributes } from './buildImage';
import DocxDocument from 'docx-document';
import { computeImageDimensions } from './computeImageDimensions';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { fixupColorCode } from './fixupColorCode';
import { fixupFontSize } from './fixupFontSize';
import { colorlessColors } from '../constants';

export function buildRun(
  vNode: VirtualDOM.VNode | VirtualDOM.VTree,
  attributes: RunAttributes,
  docxDocumentInstance?: DocxDocument
) {
  const runFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'r');
  const runPropertiesFragment = buildRunProperties(attributes);

  if (
    isVNode(vNode) &&
    [
      'span',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'ins',
      'strike',
      'del',
      's',
      'sub',
      'sup',
      'mark',
      'blockquote',
      'code',
      'pre',
    ].includes(vNode.tagName)
  ) {
    const textArray: string[] = [];

    let vNodes: VirtualDOM.VTree[] = [vNode];
    while (vNodes.length) {
      const tempVNode = vNodes.shift();
      if (!tempVNode) break;

      if (isVText(tempVNode)) {
        textArray.push(tempVNode.text);
      }
      if (isVNode(tempVNode)) {
        addFormattingFromNode(runPropertiesFragment, tempVNode);

        if (tempVNode.children?.length) {
          vNodes = tempVNode.children.slice().concat(vNodes);
        }
      }
    }
    if (textArray.length) {
      const combinedString = textArray.join('');
      // eslint-disable-next-line no-param-reassign
      vNode = new VText(combinedString);
    }
  }

  runFragment.import(runPropertiesFragment);

  if (isVNode(vNode) && vNode.tagName === 'img') {
    if (!attributes.fileContent) {
      attributes = { ...attributes, ...getPictureAttributes(docxDocumentInstance, vNode) };
    }
    computeImageDimensions(vNode, attributes);
  }

  if (isVText(vNode)) {
    const textFragment = buildTextElement(vNode.text);
    runFragment.import(textFragment);
  } else if (attributes && attributes.type === 'picture') {
    const { type, inlineOrAnchored, ...otherAttributes } = attributes;
    const imageFragment = buildDrawing(inlineOrAnchored, type, otherAttributes);
    runFragment.import(imageFragment);
  } else if (isVNode(vNode) && vNode.tagName === 'br') {
    const lineBreakFragment = buildLineBreak();
    runFragment.import(lineBreakFragment);
  }
  runFragment.up();

  return runFragment;
}

/**
 * Add the formatting from `tempVNode` to `runPropertiesFragment`
 */
function addFormattingFromNode(runPropertiesFragment: XMLBuilder, tempVNode: VirtualDOM.VNode) {
  if (tempVNode.tagName === 'span') {
    // Get styles from tempVNode, convert to run properties, then import each property into existing runPropertiesFragment
    const runAttributes = vNodeStylesToRunAttributes(tempVNode);
    Object.keys(runAttributes).forEach((key) => {
      const spanProp = buildTextFormatting(key, runAttributes[key]);
      if (!spanProp) return;

      // If this property already exists, remove it
      const existingPropNode = runPropertiesFragment.find(
        (existingProp) => existingProp.node.nodeName === spanProp.node.nodeName
      );
      if (existingPropNode) {
        existingPropNode.remove();
      }
      // Add new property node
      runPropertiesFragment.import(spanProp);
    });
  } else if (
    [
      'strong',
      'b',
      'em',
      'i',
      'u',
      'ins',
      'strike',
      'del',
      's',
      'sub',
      'sup',
      'mark',
      'code',
      'pre',
    ].includes(tempVNode.tagName)
  ) {
    const formattingFragment = buildTextFormatting(tempVNode);
    if (formattingFragment) runPropertiesFragment.import(formattingFragment);
  }
}

export function vNodeStylesToRunAttributes(vNode: VirtualDOM.VNode): RunAttributes {
  const modifiedAttributes: RunAttributes = {};
  if (vNode.properties && vNode.properties.style) {
    if (vNode.properties.style.color && !colorlessColors.includes(vNode.properties.style.color)) {
      modifiedAttributes.color = fixupColorCode(vNode.properties.style.color);
    }
    if (
      vNode.properties.style['background-color'] &&
      !colorlessColors.includes(vNode.properties.style['background-color'])
    ) {
      modifiedAttributes.backgroundColor = fixupColorCode(
        vNode.properties.style['background-color']
      );
    }
    if (vNode.properties.style['font-size']) {
      modifiedAttributes.fontSize = fixupFontSize(vNode.properties.style['font-size']);
    }
  }
  return modifiedAttributes;
}
