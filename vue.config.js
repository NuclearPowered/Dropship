module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ['registry-js', '@nuclearpowered/dropship-native-addon'],
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
