const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isProduction = process.env.NODE_ENV == 'production';

const config = {
    mode: process.env.NODE_ENV,
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devServer: {
        open: true,
        host: 'localhost'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset'
            }
        ]
    }
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        config.plugins.push(new MiniCssExtractPlugin());
    } 
    else {
        config.mode = 'development';
    }
    return config;
};
