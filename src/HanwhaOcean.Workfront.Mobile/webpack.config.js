const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/app.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.[contenthash].js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            title: "한화오션 Workfront Mobile"
        })
    ],
    devServer: {
        port: 3000,
        proxy: {
            "/api": {
                target: "https://localhost:5001",
                secure: false,
                changeOrigin: true
            }
        }
    }
};
