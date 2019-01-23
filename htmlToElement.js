import React from 'react';
import {StyleSheet, Text, Dimensions, View, WebView} from 'react-native';
import htmlparser from 'htmlparser2-without-node-native';
import entities from 'entities';

import AutoSizedImage from './AutoSizedImage';

const {width: _width} = Dimensions.get('window');

const defaultOpts = {
  lineBreak: '\n',
  paragraphBreak: '\n',
  bullet: '\u2022 ',
  TextComponent: Text,
  textComponentProps: null,
  NodeComponent: Text,
  nodeComponentProps: null,
};

const Img = props => {
  const imgStyle = {
    maxWidth: _width,
    resizeMode: 'cover',
  };

  const source = {
    uri: props.attribs.src,
    _width,
  };

  // if no src is passed, add generic image
  if (!props.attribs.src) {
    imgStyle.width = 16;
    imgStyle.height = 16;
    source.uri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAWRJREFUOI21k7FLAnEUx9/vFF08rzjw8oImTZoi6A9odwpcIhyCxubW3Kr1FCIcRM4llRKCBtdybLbi5+Lw87w47DjJBvU1xC/0upIb+m7v8b6f33vvxyOINKvrjVPbdhTwIUmKmNns7jEplc4NxxnG4nHlxQ+g1zOTkiT2g44zjKmq8pzJHG34AdTrhTZj/ZRAiDBBBOLHDACACIQQYSL4Nbr1fwBE6vkriFRCpN8jewIQ6V61eveASPdd+XSr9XgNAEAIoCcAke4Ui1cXhvGa0LRyBZHmEKmKSHP5fPm23e5sEZJAXh90mTd1vVEZjT4kntO08oksLx9Y1mANACAcDr3/2AFvp9m8vxwM7FV3V9zspbkRul2W+q2Qazweh2bjuRFUVelY1tvKXwBZXjLmAIjTAA/S6cPtRR3MCnEaCIpixGTMXK/VCk98F4uNQBgzk9Go2Cdf53xzZtvDmJ/X+Tl/ArQ4nue4vQorAAAAAElFTkSuQmCC';
  }

  return <AutoSizedImage source={source} style={imgStyle} />;
};

export default function htmlToElement(rawHtml, customOpts = {}, done) {
  const opts = {
    ...defaultOpts,
    ...customOpts,
  };

  function inheritedStyle(parent) {
    if (!parent) return null;
    const style = StyleSheet.flatten(opts.styles[parent.name]) || {};
    const parentStyle = inheritedStyle(parent.parent) || {};
    return {...parentStyle, ...style};
  }

  function domToElement(dom, parent) {
    if (!dom) return null;

    const renderNode = opts.customRenderer;
    let orderedListCounter = 1;

    return dom.map((node, index, list) => {
      if (renderNode) {
        const rendered = renderNode(
          node,
          index,
          list,
          parent,
          domToElement
        );
        if (rendered || rendered === null) return rendered;
      }

      const {TextComponent} = opts;

      if (node.type === 'text') {
        const defaultStyle = opts.textComponentProps ? opts.textComponentProps.style : null;
        const customStyle = inheritedStyle(parent);
        const text = parent && parent.name === 'figcaption' ? (node.data && node.data.toUpperCase()) : node.data;
        const liStyle = parent && parent.name === 'li' ? inheritedStyle({name: 'itemText'}) : {};
        return (
          <TextComponent
            {...opts.textComponentProps}
            key={index}
            style={[defaultStyle, customStyle, liStyle]}
          >
            {entities.decodeHTML(text)}
          </TextComponent>
        );
      }

      if (node.type === 'tag') {
        if (node.name === 'img') {
          return <Img key={index} attribs={node.attribs} />;
        } else if (node.name === 'iframe') {
          const ratio = node.attribs.ratio ? Number(node.attribs.ratio) : 0.75;
          const paddingHorizontal = opts && opts.styles && opts.styles.iframe && opts.styles.iframe.paddingHorizontal ? Number(opts.styles.iframe.paddingHorizontal) : 15;
          const width = node.attribs.width ? Number(node.attribs.width) : _width - 2 * paddingHorizontal;
          const height = node.attribs.height ? Number(node.attribs.height) : width * ratio;
          const style = {
            width,
            height,
          };
          return <WebView
            key={index}
            ref={(ref) => { this[node.attribs.src] = ref; }}
            style={style}
            source={{uri: node.attribs.src}}
            onNavigationStateChange={(event) => {
              if (event.url !== node.attribs.src) {
                this[node.attribs.src].stopLoading();
                // Linking.openURL(event.url);
              }
            }}
          />;
        }

        let linkPressHandler = null;
        let linkLongPressHandler = null;
        if (node.name === 'a' && node.attribs && node.attribs.href) {
          let link = entities.decodeHTML(node.attribs.href);
          // remove not expected codes
          link = link && link.replace(/^'|"|”/, '').replace(/$'|"|”/, '');
          linkPressHandler = () =>
            opts.linkHandler(link);
          if (opts.linkLongPressHandler) {
            linkLongPressHandler = () =>
              opts.linkLongPressHandler(link);
          }
        }

        let linebreakBefore = null;
        let linebreakAfter = null;
        if (opts.addLineBreaks) {
          switch (node.name) {
          case 'pre':
          case 'footer':
            linebreakBefore = opts.lineBreak;
            break;
          case 'p':
            if (index < list.length - 1) {
              linebreakAfter = opts.paragraphBreak;
            }
            break;
          case 'br':
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
          case 'div':
          case 'figure':
            linebreakAfter = opts.lineBreak;
            break;
          }
        }

        const {NodeComponent, styles} = opts;

        let children = [linebreakBefore, domToElement(node.children, node), linebreakAfter];
        let hasView = false;

        if (node.name === 'ul' || node.name === 'ol' || node.name === 'figure' || node.name === 'blockquote') {
          hasView = true;
          children = domToElement(node.children, node);
        } else if (node.name === 'li') {
          hasView = true; 
          children = [
            <TextComponent key={`${index}-1`} style={inheritedStyle({name: parent.name === 'ol' ? 'listNumber' : 'listBullet'})}>
              {parent.name === 'ol' ? `${orderedListCounter++}.` : opts.bullet}
            </TextComponent>,
            <TextComponent key={`${index}-2`} style={inheritedStyle({name: 'itemText'})}>
              {domToElement([node.children[0]], node)}
            </TextComponent>
          ];
          if (node.children.length > 1) {
            return (
              [
                renderChildrenView(node, styles, index, children),
                domToElement([node.children[1]], node)
              ]
            )
          }
          if (opts.addLineBreaks && index < list.length - 1) {
            linebreakAfter = opts.lineBreak;
          }
        }

        if (hasView) {
          return renderChildrenView(node, styles, index, children);
        }

        return <NodeComponent
            {...opts.nodeComponentProps}
            key={index}
            onPress={linkPressHandler}
            style={[
              !node.parent ? styles[node.name] : null,
            ]}
            onLongPress={linkLongPressHandler}
          >
            {children}
          </NodeComponent>;
      }
    });
  }

  function renderChildrenView(node, styles, index, children) {
      return <View
      style={!node.parent || node.name === 'li' ? styles[node.name] : null}
      key={index}
    >
      {children}
    </View>;
  }

  const handler = new htmlparser.DomHandler(function(err, dom) {
    if (err) done(err);
    done(null, domToElement(dom));
  });
  const parser = new htmlparser.Parser(handler);
  parser.write(rawHtml);
  parser.done();
}
