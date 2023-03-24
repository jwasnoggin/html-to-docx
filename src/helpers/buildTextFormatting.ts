import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import {
  buildBold,
  buildItalics,
  buildUnderline,
  buildStrike,
  buildVertAlign,
  buildHighlight,
  buildRunFontFragment,
  buildColor,
  buildFontSize,
  buildRunStyleFragment,
} from './buildFragments';
import { buildShading } from './buildShading';

// eslint-disable-next-line consistent-return

export function buildTextFormatting(
  vNodeOrTagName: VirtualDOM.VNode | string,
  attribute?: any
): XMLBuilder | undefined {
  const tagName = typeof vNodeOrTagName === 'string' ? vNodeOrTagName : vNodeOrTagName.tagName;
  switch (tagName) {
    case 'strong':
    case 'b':
      return buildBold();
    case 'em':
    case 'i':
      return buildItalics();
    case 'ins':
    case 'u':
      return buildUnderline();
    case 'strike':
    case 'del':
    case 's':
      return buildStrike();
    case 'sub':
      return buildVertAlign('subscript');
    case 'sup':
      return buildVertAlign('superscript');
    case 'mark':
      return buildHighlight();
    case 'code':
      return buildHighlight('lightGray');
    case 'pre':
    case 'font':
      return buildRunFontFragment('Courier');
    case 'color':
      if (attribute) return buildColor(attribute);
      break;
    case 'backgroundColor':
      if (attribute) return buildShading(attribute);
      break;
    case 'fontSize':
      if (attribute) return buildFontSize(attribute);
      break;
    case 'hyperlink':
      return buildRunStyleFragment('Hyperlink');
    case 'highlightColor':
      return buildHighlight(attribute);
  }
}
