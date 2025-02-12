
const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');
const webpack = require('webpack');
const {minify} = require('minify');


const minifiedFiles = [
    'index.html',
    'run.html',
    'theme.css',
];

const copiedFiles = [
    'favicon.ico',
    'img/icon.svg',
    'img/logo.svg',
];

const webpackedFiles = [
    'index.ts',
    'run.ts',
];


const mode = process.argv[2];

function buildOthers() {
    console.log('build: building fake-node');
    execSync('cd ../../fake-node && npm run build');
    console.log('build: building @wildeast/core');
    execSync('cd ../core && npm run build');
}

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
    if (!stats.hasErrors()) {
        copyFiles();
        await minifyFiles();
        console.log('build: complete');
    }
}

function main() {
    if (process.argv.includes('all')) {
        try {
            buildOthers();
        } catch (error) {
            console.log(error.stdout.toString('utf8'));
            return;
        }
    }
    console.log('build: running webpack\n');
    webpack({
        mode: mode,
        entry: Object.fromEntries(webpackedFiles.map(file => [path.parse(file).name, path.resolve(path.join('./src', file))])),
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
        },
        resolve: {
            extensions: ['.js', '.ts'],
            modules: [
                path.resolve(__dirname, 'node_modules'),
                path.resolve(__dirname, '../core/node_modules')
            ],
            symlinks: true,
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
}

main();
