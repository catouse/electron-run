/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import validate from 'webpack-validator';
import {
    dependencies as externals
} from '../app/package.json';

export default validate({
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loaders: ['babel-loader'],
            exclude: /node_modules/
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }, {
            test: /\.css$/,
            loader: 'style!css'
        }],
        noParse: [/ajv/]
    },

    output: {
        path: path.join(__dirname, '../app'),
        filename: 'bundle.js',

        // https://github.com/webpack/webpack/issues/1114
        libraryTarget: 'commonjs2'
    },

    // https://webpack.github.io/docs/configuration.html#resolve
    resolve: {
        extensions: ['', '.js', '.jsx', '.json'],
        packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
        alias: {
            Platform: 'platform/electron',
            Config: 'config/index.js',
            ExtsRuntime: 'exts/runtime.js',
            ExtsView: 'views/exts/index.js',
        },
        root: path.join(__dirname, '../app')
    },

    plugins: [],

    externals: Object.keys(externals || {})
});
