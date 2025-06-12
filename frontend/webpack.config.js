const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index_bundle.js',
        path: path.resolve(__dirname, './dist'),
        clean: true,
    },
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        static: './dist',
        port: 8080,
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        ],
        open: true,
        hot: true,
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
                test:/\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            { 
                test: /\.txt$/, use: 'raw-loader' 
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template:'./public/index.html',
            filename: 'index.html',
        }),
    ],
};