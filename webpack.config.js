const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/client/index.tsx',
    output: {
        filename: 'js/[name].js',
        path: `${__dirname}/public`,
        publicPath: '/public',
    },
    devtool: 'source-map',
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.json', '.jsx'],
        modules: [ path.resolve(__dirname, 'src', 'client'), path.resolve(__dirname, 'src', 'common'), 'node_modules'],
    },
    devServer: {
        stats: {
            chunkModules: false,
            colors: true,
            path: path.resolve(__dirname, 'public'),
        },
        contentBase: `${__dirname}/public/client`,
        historyApiFallback: true,
        publicPath: 'http://localhost:8082',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loaders: [ 'babel-loader', 'ts-loader' ],
                include: path.resolve('src', 'client')
            },
            {
                test: /\.tsx?$/,
                loaders: [ 'babel-loader', 'ts-loader' ],
                include: path.resolve('src', 'ether')
            },
            {
                test: /\.tsx?$/,
                loaders: [ 'babel-loader', 'ts-loader' ],
                include: path.resolve('src', 'lookfit')
            },
            {
                test: /\.(s*)css$/,
                use: ExtractTextPlugin.extract({
                    fallback:'style-loader',
                    use:['css-loader','sass-loader'],
                }),
                include: path.resolve('src')
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin({filename: 'css/app.bundle.css'}),
        new HtmlWebpackPlugin({
            template: 'src/client/index.template.html',
            filename: 'html/index.html',
            appMountId: 'app',
            inject: true,
        }),
        new CopyWebpackPlugin([
            {from: "src/client/login.html", to: "html/login.html"},
            {from: "src/lookfit/fonts", to: "fonts"},
            {from: "src/client/images", to: "images"}
        ]),
        new WriteFilePlugin({ log: true }),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor'],
        }),
    ]
};
