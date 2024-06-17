const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Location of the Cesium static files
const cesiumSource = "node_modules/cesium/Source";
// Build files for Cesium
const cesiumWorkers = "../Build/Cesium/Workers";
// Plugin to copy Cesium files to the build folder
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  context: __dirname,

  // Input script
  entry: {
    app: "./src/index.js",
  },
  // Output script in the dist folder
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist"),
    sourcePrefix: "",
  },
  amd: {
    // Enable webpack-friendly use of require in Cesium
    toUrlUndefined: true,
  },
  // Resolve: How to handle the modules included in the project
  resolve: {
    alias: {
      cesium: path.resolve(__dirname, cesiumSource),
    },
    mainFiles: ["module", "main", "Cesium"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
        use: ["url-loader"],
      },
    ],
    // loaders: [
    //   {
    //     test: /\.json$/,
    //     loader: "json-loader",
    //   },
    // ],
  },
  // Extended capabilities such as optimization, asset management, injection of ENV varibles.
  plugins: [
    // Adds the output bundle script to the index.html file.
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" },
        { from: path.join(cesiumSource, "Assets"), to: "Assets" },
        { from: path.join(cesiumSource, "Widgets"), to: "Widgets" },
        { from: path.join(cesiumSource, "ThirdParty"), to: "ThirdParty" },
      ],
    }),
    new webpack.DefinePlugin({
      // Define relative base path in cesium for loading assets as an ENV varaible
      CESIUM_BASE_URL: JSON.stringify(""),
    }),
  ],
  mode: "development",
};
