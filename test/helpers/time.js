

/*
based on https://kauri.io/article/f95f956261494090be1aaa8227464773
The above extract uses the web3 library to get the latest block from the EVM and from that return its timestamp in seconds.
*/

async function getCurrentTime() {
    const block = await web3.eth.getBlock('latest');  //in sec
    return new Date(block.timestamp * 1000).toLocaleTimeString();
}

module.exports = {
    getCurrentTime
}
