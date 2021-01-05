module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ['registry-js', 'ffi-napi', 'ref-napi'],
      builderOptions: {
        publish: [
          {
            provider: 'github',
            owner: 'NuclearPowered',
            private: true
          }
        ],
        linux: {
          target: 'AppImage',
          category: 'Game'
        },
        extraResources: [
          {
            from: 'build/lib',
            to: 'lib',
            filter: ['*.so', '*.dll']
          }
        ]
      }
    }
  }
}
