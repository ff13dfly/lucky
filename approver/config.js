exports.config = {
    "vname":"approver",
    "autosaving":60000,
    "low":2000000000000,            //balance low than this, failed to faucet
    "server": {
        "protocol":"http",
        "port": 7744,
        "address": "127.0.0.1"       //faucet.w3os.net
    },
    "debug":true,              //debug mode, CROS support
};