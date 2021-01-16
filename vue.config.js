module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ['registry-js', 'bindings', 'node-addon-api', '@nuclearpowered/dropship-native-addon'],
      builderOptions: {
        appId: 'gg.nuclearpowered.dropship',
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
        }
      }
    }
  }
}
