
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const {minify} = require('minify');

const minifiedFiles = [
    'index.html',
    'theme.css',
];

const copiedFiles = [
    'favicon.ico',
    'theme.css',
    'img/icon.svg',
    'img/logo.svg',
];

const webpackedFiles = [

];

const mode = process.argv[2];

function copyFiles() {
    console.log('build: copying files');
    for (const file of copiedFiles) {
        fs.copyFileSync(path.join('src', file), path.join('dist', file));
    }
}

async function minifyFiles() {
    console.log('build: minifying files');
    for (const file of minifiedFiles) {
        fs.writeFileSync(path.join('dist', file), await minify(path.join('src', file), {
            
        }));
    }
}

async function afterWebpack(err, stats) {
    if (err) {
        console.log('build: error while running webpack:\n');
        console.error(err);
        return;
    }
    console.log(stats.toString({colors: true}) + '\n');
    copyFiles();
    minifyFiles();
    console.log('build: complete');
}

console.log('build: running webpack\n');

webpack({
    mode: mode,
    entry: Object.fromEntries(webpackedFiles.map(file => [path.basename(file), path.join('src', file)])),
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.ts'],
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
}, afterWebpack);
