const { PublicKey,Connection,Keypair } =require("@solana/web3.js");
const fs = require("fs");
const {config}=require("../config");

const devnet=config.node;
let  linker=null;
const self={
    init: async ()=>{
        if(linker===null) linker = new Connection(devnet);

    },
}

const Solana={
    validAccount:(acc)=>{
        try {
            new PublicKey(acc);
            return true;
        } catch (e) {
            return false;
        }
    },
    getNewAccount:()=>{
        return new Keypair();
    },
    getAccount:async(addr)=>{
        self.init();
        if(!Solana.validAccount(addr)) return false;
        const account=new PublicKey(addr);
        const info= await linker.getAccountInfo(account);
        return info;
    },
    recentTxs:async (acc,limit = 10)=>{
        self.init();
        try {
            const pubkey = new PublicKey(acc);
            const signatures = await linker.getSignaturesForAddress(pubkey, { limit });
            return signatures;
        } catch (error) {
            return {error:"Failed to query."};
        }
    },
    getCurrentSlot:async (ck)=>{
        self.init();
        return ck && ck(await linker.getBlockHeight());
    },
    getSlotHash: async (slot,ck)=>{
        self.init();
        //console.log(slot);
        try {
            const cfg={commitment: "confirmed",maxSupportedTransactionVersion:0};
            const block = await linker.getBlock(slot, cfg);
            if (block && block.blockhash) {
                return ck && ck(block.blockhash);
            } else {
                return ck && ck({error:"Unconfirmed block."});
            }
        } catch (error) {
            //console.log(error);
            return ck && ck({error:"Failed to get block hash."});
        }
    },
    getTransaction:async (hash,ck)=>{
        self.init();
        const cfg={commitment: "confirmed",maxSupportedTransactionVersion:0}
        const tx = await linker.getParsedTransaction(hash,cfg);
        return ck && ck(tx);
    },
    getConnection:()=>{
        return linker;
    },
    getKeypairFromFile:(path)=>{
        const secretKeyString = fs.readFileSync(path, "utf8");
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return Keypair.fromSecretKey(secretKey);
    },
}

module.exports = Solana;