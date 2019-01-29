/**
 * Custom WebView with autoHeight feature
 *
 * @prop source: Same as WebView
 * @prop autoHeight: true|false
 * @prop defaultHeight: 100
 * @prop width: device Width
 * @prop ...props
 *
 * @author Elton Jain
 * @version v1.0.2
 */

import React, { Component } from 'react';
import {
  View,
  WebView,
  Platform,
  Linking,
  TouchableHighlight
} from 'react-native';

const injectedScript = function() {
  function waitForBridge() {
    if (window.postMessage.length !== 1){
      setTimeout(waitForBridge, 200);
    } else {
      const post = postMessage;
      const postMsg = () => {
        post(
          JSON.stringify({height: Math.max(document.documentElement.clientHeight || 0,
            document.documentElement.scrollHeight  || 0,
            document.body.clientHeight || 0,
            document.body.scrollHeight || 0)})
        )
      };
      // window.onclick = function(e) {
      //   e.preventDefault();
      //   post(JSON.stringify({link: 'link'}));
      //   e.stopPropagation()
      // }
      postMsg();
      // force to update height
      [1, 3, 5, 12].forEach(time => setTimeout(postMsg, time * 1000));
    }
  }
  waitForBridge();
};

export default class MyWebView extends Component {
  state = {
    webViewHeight: Number
  };

  static defaultProps = {
      autoHeight: true,
  }

  constructor (props) {
    super(props);
    this.state = {
      webViewHeight: this.props.defaultHeight
    }

    this._onMessage = this._onMessage.bind(this);
  }

  _onMessage(e) {
    const data = e.nativeEvent.data && JSON.parse(e.nativeEvent.data);
    if (data && data.height) {
      this.setState({
        webViewHeight: parseInt(data.height)
      });
    } else if (data && data.link) {
      this.openLink();
    }
  }

  stopLoading() {
    this.webview.stopLoading();
  }

  reload() {
    this.webview.reload();
  }

  openLink() {
    if (this.props.href) {
      Linking.openURL(this.props.href);
    }
  }

  render () {
    const _h = this.props.autoHeight ? this.state.webViewHeight : this.props.defaultHeight;
    const androidScript = 'window.postMessage = String(Object.hasOwnProperty).replace(\'hasOwnProperty\', \'postMessage\');' +
    '(' + String(injectedScript) + ')();';
    const iosScript = '(' + String(injectedScript) + ')();' + 'window.postMessage = String(Object.hasOwnProperty).replace(\'hasOwnProperty\', \'postMessage\');';
    return (
      <View>
        <WebView
          ref={(ref) => { this.webview = ref; }}
          injectedJavaScript={Platform.OS === 'ios' ? iosScript : androidScript}
          scrollEnabled={this.props.scrollEnabled || false}
          onMessage={this._onMessage}
          javaScriptEnabled={true}
          automaticallyAdjustContentInsets={true}
          {...this.props}
          style={[this.props.style, {height: _h}]}
        />
        <TouchableHighlight
          onPress={this.openLink.bind(this)}
          style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}
          underlayColor={'transparent'}
        >
          <View />
        </TouchableHighlight>
      </View>
    )
  }
}