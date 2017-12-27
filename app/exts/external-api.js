import React from 'react';
import ReactDOM from 'react-dom';
import ReactSplitPane from 'react-split-pane';
import marked from 'marked';
import md5 from 'md5';
import extractZip from 'extract-zip';
import compareVersions from 'compare-versions';
import hotkeys from 'hotkeys-js';
import uuid from 'uuid';
import platform from 'Platform';
import components from '../components';
import lang from '../lang';
import utils from '../utils';
import app from '../core';
import views from '../views/external';

const nodeModules = {
    React,
    ReactDOM,
    ReactSplitPane,
    marked,
    md5,
    fs: platform.fs,
    extractZip,
    compareVersions,
    hotkeys,
    uuid,
};

export default {
    lang,
    components,
    utils,
    platform,
    app,
    views,
    nodeModules
};
