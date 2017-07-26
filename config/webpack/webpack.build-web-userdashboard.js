var path = require("path")
    , webpack = require("webpack")
    ;

module.exports = {
    "entry": "./lib/components/userdashboard/UserDashboardView.jsx",
    "output": {
        path: path.join(__dirname,"../../public/js"),
        filename: "swellist-dashboard.js"
    },
    "module": {
        "loaders": [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
    "plugins": [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
                APP_ENV: JSON.stringify('browser')
            }
        })
    ]
};
