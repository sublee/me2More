// ==UserScript==
// @name        me2More
// @namespace   http://heungsub.net/apps/me2more/me2more.js
// @include     http://me2day.net/*
// @author      Lee, Heungsub
// @homepage    http://heungsub.net/
// @license     MIT LICENSE
// ==/UserScript==
try {
    if (document.getElementsByTagName('body')[0] != undefined) {
        s = document.createElement('script');
        s.setAttribute('charset', 'UTF-8');
        s.setAttribute('id', '--me2more-user-script');
        s.setAttribute('src',' http://heungsub.net/apps/me2more/me2more.js' + '?' + (Math.random() + '').slice(2));
        document.body.appendChild(s);
    }
} catch (e) {}

