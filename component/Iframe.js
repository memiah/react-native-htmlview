import React, {Component} from 'react';
import {
  Image,
  Dimensions,
  WebView,
  Linking
} from 'react-native';

import WebViewAutoHeight from './WebViewAutoHeight';

const {width: _width} = Dimensions.get('window');

export default class Iframe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  
  render() {
      const ratio = this.props.attribs.ratio ? Number(this.props.attribs.ratio) : 0.75;
      const opts = this.props.opts;
      const paddingHorizontal = opts && opts.styles && opts.styles.iframe && opts.styles.iframe.paddingHorizontal ? Number(opts.styles.iframe.paddingHorizontal) : 15;
      const width = this.props.attribs.width ? Number(this.props.attribs.width) : _width - 2 * paddingHorizontal;
      const index = this.props.index;

      const srcContent = {
        bounces: false,
        scrollEnabled: false,
        style: {
          width,
          height: this.props.attribs.height ? Number(this.props.attribs.height) : width * ratio
        },
        source: {uri: this.props.attribs.src},
        onNavigationStateChange: (event) => {
          if (this.props.attribs.src && event.url !== this.props.attribs.src) {
            this[index].stopLoading();
            Linking.openURL(event.url);
          }
        },
      };

      const htmlContent = {
        bounces: false,
        scrollEnabled: true,
        style: {
          width,
        },
        source: this.props.attribs.src ? {uri: this.props.attribs.src} : {html: this.props.attribs.html},
        href: this.props.attribs.href,
        defaultHeight: this.props.attribs.height && parseInt(this.props.attribs.height),
      }

      const isResizable = this.props.attribs.resize === 'true';
      const View = isResizable ? WebViewAutoHeight : WebView;

      return <View
        key={index}
        ref={(ref) => { this[index] = ref; }}
        {...(isResizable ? htmlContent : srcContent)}
      />;
  }
}
