
const path = require('path');

module.exports = function(env, argv) {
    return {
        entry: {
            index: './src',
        },
        output: {
            filename: '[name].html',
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
        devtool: argv.mode === 'development' ? 'eval-source-map' : undefined,
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
    };
}
