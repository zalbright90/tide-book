const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        static: './dist',
        port: 3000,
        open: true,
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test:/\css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new htmlWebpackPlugin({
            template:'./public/index.html',
            filename: 'index.html',
        }),
    ],
};