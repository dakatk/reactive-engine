const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');

module.exports = {
    entry: './src/app.js',
    devServer: {
        contentBase: './dist',
    },
    output: {
        filename: 'bundle.js',
        path: distDir,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(jpg|jpeg|gif|png|ico)$/,
                exclude: /node_modules/,
                use: 'file-loader?name=[name].[ext]'
             }
        ],
    },
};