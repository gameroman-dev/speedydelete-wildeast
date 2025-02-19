
import {join, parse, resolve as resolve} from 'path';
import {copyFileSync, writeFileSync} from 'fs';
import {execSync} from 'child_process';
import webpack from 'webpack';
import WatchExternalFilesPlugin from 'webpack-watch-external-files-plugin';
import {minify} from 'minify';


const minifiedFiles = [
    'index.html',
    'run.html',
    'edit.html',
    'theme.css',
];

const copiedFiles = [
    'favicon.ico',
    'img/icon.svg',
    'img/logo.svg',
    'img/icon.png'
];

const webpackedFiles = [
    'index.tsx',
    'run.tsx',
    'edit.tsx',
];


const mode = process.argv.includes('dev') ? 'development' : 'production';


function buildOthers(): void {
    console.log('build: building fake-node');
    execSync('cd ../../fake-node && npm run build');
    console.log('build: building @wildeast/core');
    execSync('cd ../core && npm run build');
}

function copyFiles(): void {
    console.log('build: copying files');
    for (const file of copiedFiles) {
        copyFileSync(join('src', file), join('dist', file));
    }
}

async function minifyFiles(): Promise<void> {
    if (mode === 'development') {
        for (const file of minifiedFiles) {
            copyFileSync(join('src', file), join('dist', file));
        }
    } else {
        console.log('build: minifying files');
        for (const file of minifiedFiles) {
            writeFileSync(join('dist', file), await minify(join('src', file), {
                
            }));
        }
    }
}


async function afterWebpack(err: Error | null, stats?: webpack.Stats): Promise<void> {
    if (err) {
        console.log('build: error while running webpack:\n');
        console.error(err);
        return;
    }
    if (stats === undefined) {
        console.log('build: stats is undefined, this error should not happen');
        return;
    }
    console.log(stats.toString({colors: true}) + '\n');
    if (!stats.hasErrors()) {
        copyFiles();
        await minifyFiles();
        console.log('build: complete');
    }
    if (compiler !== undefined && !compiler.watching) {
        compiler.close(() => {});
    }
}


if (process.argv.includes('all')) {
    try {
        buildOthers();
    } catch (error) {
        console.log(error.stdout.toString('utf8'));
        process.exit(1);
    }
}


const watching = process.argv.includes('watch');

const envPreset = [
    '@babel/preset-env',
    {
        targets: '> 0.5%, not dead',
    },
];
const customJSXPreset = [
    '@babel/preset-react',
    {
        pragma: 'JSX.createElement',
        pragmaFrag: 'JSX.Fragment',
    },
];

let plugins: any[] = [
    new webpack.ProvidePlugin({'JSX': './jsx'}),
];
if (watching) {
    plugins.push(new WatchExternalFilesPlugin({files: copiedFiles.concat(minifiedFiles).map(path => resolve(import.meta.dirname, 'src', path))}));
}

console.log('build: running webpack\n');

const compiler = webpack({
    mode: mode,
    entry: Object.fromEntries(webpackedFiles.map(file => [parse(file).name, resolve(join('./src', file))])),
    output: {
        filename: '[name].js',
        path: resolve(import.meta.dirname, 'dist'),
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
        modules: [
            resolve(import.meta.dirname, 'node_modules'),
            resolve(import.meta.dirname, '../core/node_modules')
        ],
        symlinks: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {presets: [envPreset]},
            },
            {
                exclude: /node_modules/,
                test: /\.ts$/,
                loader: 'babel-loader',
                options: {presets: [envPreset, '@babel/preset-typescript']},
            },
            {
                exclude: /node_modules/,
                test: /\.tsx$/,
                loader: 'babel-loader',
                options: {presets: ['@babel/preset-env', '@babel/preset-typescript', customJSXPreset]},
            },
        ],
    },
    devtool: mode === 'development' ? 'source-map' : undefined,
    plugins: plugins,
});

if (process.argv.includes('watch')) {
    compiler.watch({}, afterWebpack);
} else {
    compiler.run(afterWebpack);
}
