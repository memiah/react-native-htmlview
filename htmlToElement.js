import { StyleSheet, Platform } from 'react-native';
import _ from 'underscore';

import colors from './color.enum.style';
import { fontFamily } from './font.enum.style';
// import textStyles from './../../style/text.style.js';

function create(params) {
    const defaultText = _.extend({
        fontFamily: fontFamily.regular,
        fontSize: 16,
        lineHeight: Platform.OS === 'android' ? 32 : 21,
        color: colors.black
    }, params || {});
    const defaultH = {fontFamily: fontFamily.bold, color: colors.black};
    const boldStyle = {...defaultText, fontFamily: fontFamily.bold};
    const italicStyle = {...defaultText, fontStyle: 'italic', fontFamily: fontFamily.italic};
    const underlineStyle = {...defaultText, textDecorationLine: 'underline'};
    const codeStyle = {...defaultText, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'};

    return StyleSheet.create({
        b: boldStyle,
        strong: boldStyle,
        i: italicStyle,
        em: italicStyle,
        u: underlineStyle,
        pre: codeStyle,
        code: codeStyle,
        a: {
            ...defaultText,
            color: colors.green,
            textDecorationLine: 'underline',
        },
        p: {
            ...defaultText
        },
        div: {
            ...defaultText
        },
        strike: {
            ...defaultText,
            textDecorationLine: 'line-through'
        },
        blockquote: {
            // ...italicStyle,
            padding: 0,
            borderLeftWidth: 5,
            borderLeftColor: '#4dbfbf',
            paddingHorizontal: 15,
            paddingVertical: 10,
            marginBottom: 30,
        },
        cite: {
            ...defaultText,
            fontFamily: fontFamily.bold,
            fontSize: 12
        },
        abbr: {
            ...defaultText,
            fontSize: 14,
            color: colors.darkGray,
            textDecorationStyle: 'dotted',
            textDecorationLine: 'underline'
        },
        h1: {...defaultH, fontSize: 20, lineHeight: Platform.OS === 'android' ? 34 : 25},
        h2: {...defaultH, fontSize: 18, lineHeight: Platform.OS === 'android' ? 32 : 23},
        h3: {...defaultH, fontSize: 16, lineHeight: Platform.OS === 'android' ? 30 : 21},
        h4: {...defaultH, fontSize: 14, lineHeight: Platform.OS === 'android' ? 28 : 19},
        h5: {...defaultH, fontSize: 12, lineHeight: Platform.OS === 'android' ? 26 : 17},
        h6: {...defaultH, fontSize: 10, lineHeight: Platform.OS === 'android' ? 24 : 15},
        ol: {
            // color: colors.pink,
            paddingHorizontal: 10,
            paddingTop: 10
        },
        ul: {
            // color: colors.pink,
            paddingHorizontal: 10,
            paddingTop: 10
        },
        li: {
            // ...defaultText,
            flexDirection: 'row',
            marginBottom: 10,
        },
        itemText: {
            ...defaultText,
            flex: 1,
            paddingLeft: 5
        },
        listBullet: {
            color: colors.pink,
            fontSize: 15,
            marginTop: 1,
            lineHeight: 15,
            width: 10
        },
        listNumber: {
            ...boldStyle,
            color: colors.pink,
            width: 25,
        },
        hr: {
            backgroundColor: colors.grayDivider,
            height: 1,
            marginVertical: 10,
            marginBottom: 40,
        },
        figure: {
            flex: 1,
            alignContent: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10
        },
        figcaption: {
            ...defaultText,
            fontSize: 10,
            color: colors.darkGray,
            textAlign: 'center',
            width: '100%'
        },
        img: {
            marginBottom: 10,
        }
    });
}


export function createStyle(params) {
    return create(params);
}

export default create();
