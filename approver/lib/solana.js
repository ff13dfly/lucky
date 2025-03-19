const { PublicKey,Connection,Keypair } =require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");
const IDL = require("./luckysig.json");
const fs = require("fs");
const bs58 = require("bs58").default;

const devnet="https://winter-old-bridge.solana-devnet.quiknode.pro/982a105c0cf37e14d1977ecba41113f7ef2ea049";

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
    validSignature:(sign)=>{
        const signatureBytes = bs58.decode(sign);
        if (signatureBytes.length !== 64) return false;
        return true;
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
    getPDA:(seeds,PID)=>{
        const bs=[];
        for(let i=0;i<seeds.length;i++){
            bs.push(Buffer.from(seeds[i]));
        }
        const [PDA] = PublicKey.findProgramAddressSync(bs,PID);
        return PDA;
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
    getSlotHash: async (slot,ck)=>{
        self.init();
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
    getContract: async (wallet) =>{
        self.init();
        const provider = new anchor.AnchorProvider(linker, wallet, {commitment: 'confirmed' });
        const caller = new anchor.Program(IDL,provider);
        return caller
    },
    getConnection:()=>{
        return linker;
    },
    getKeypairFromFile:(path)=>{
        const secretKeyString = fs.readFileSync(path, "utf8");
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        return Keypair.fromSecretKey(secretKey);
    },
    getWallet:(path)=>{
        const secretKeyString = fs.readFileSync(path, "utf8");
        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        const ks=Keypair.fromSecretKey(secretKey);
        return new anchor.Wallet(ks)
    },
    onChange:async(pubkey,ck)=>{
        linker.onAccountChange(pubkey, (updatedAccountInfo) => {
            return ck && ck(updatedAccountInfo);
        });
    },
}


module.exports = Solana;