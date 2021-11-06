module.exports = {
  transpileDependencies: ["vuetify"],
  publicPath: process.env.NODE_ENV === 'production'
    ? '/draw-rectangles-together/draw-rectangles-together-client'
    : '/'
};
