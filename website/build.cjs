
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const mode = process.argv[2];

function afterWebpack(err, stats) {
    if (err) {
        console.log('build: error while running webpack:\n');
        console.error(err);
        return;
    }
    console.log(stats.toString({colors: true}));
    console.log('\nbuild: copying images');
    console.log('build: complete');
}

console.log('build: running webpack\n');

webpack({
    mode: mode,
    entry: {
        index: './src/test.js',
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
    resolve: {
        extensions: ['.html', '.js', '.jsx', '.ts', '.tsx'],
        modules: [path.resolve(__dirname, 'node_modules')],
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.js?$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                },
            },
            {
                exclude: /node_modules/,
                test: /\.ts$/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-typescript'],
                },
            },
        ],
    },
    devtool: mode === 'development' ? 'eval-source-map' : undefined,
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
        hot: true,
        liveReload: true,
        watchFiles: ['src/**/*', 'dist/**/*'],
        devMiddleware: {
            writeToDisk: false,
        },
    },
}, afterWebpack);
