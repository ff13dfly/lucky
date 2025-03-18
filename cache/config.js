exports.config = {
    "name":"cache",
    "server": {
        "protocol":"http",
        "port": 9666,
        "address": "127.0.0.1",
    },
    "file":{
        "name":"localcache.json",
        "interval":6000,               //1m to save cache
    },
    "redis":true,           //wether use redis to storage data
    "debug":true,           //debug mode, CROS support
    //https://api.devnet.solana.com
    "node":"https://winter-old-bridge.solana-devnet.quiknode.pro/982a105c0cf37e14d1977ecba41113f7ef2ea049",
};