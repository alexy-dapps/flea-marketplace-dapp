const path = require('path');

// looks like in the latest import version of ipfs-http-client, 
// we don't need to explicitly specify those node modules bellow
module.exports = {
  node: {
    crypto: true,
    path: true,
    os: true,
    stream: true,
    buffer: true,
  },

  // fix for issue: https://github.com/multiformats/js-cid/issues/96
  resolve: {
    alias: {
      'multicodec/src/base-table': path.dirname(
        require.resolve('multicodec/src/base-table.json')
      )
    }
  }
};
