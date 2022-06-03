const path = require('path');

module.exports = {
    resolve: {
        symlinks: false,
        extensions: ['.ts', '.js']
    },
    devtool: 'source-map',
    devServer: {
      hot: true,
    },
    module: {
        rules: [
          {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
          {
            test: /\.glsl$/i,
            loader: 'shader-loader',
          },
          {
            test: /\.js$/,
            include: path.resolve(__dirname, 'Sources'),
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                },
              },
            ],
          },
          {
            test: /\.css$/,
            exclude: /\.module\.css$/,
            use: [
              { loader: 'style-loader' },
              { loader: 'css-loader' },
              { loader: 'postcss-loader' },
            ],
          },
          {
            test: /\.html$/,
            use: [
              { loader: 'html-loader' },
            ],
          },
          {
            test: /\.module\.css$/,
            use: [
              { loader: 'style-loader' },
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[name]-[local]_[sha512:hash:base64:5]',
                  },
                },
              },
              { loader: 'postcss-loader' },
            ],
          },
          {
            test: /\.svg$/,
            type: 'asset/source',
          },
          {
            test: /\.worker\.js$/,
            use: [{ loader: 'worker-loader', options: { inline: 'no-fallback' } }],
          },
        ]
    }
}