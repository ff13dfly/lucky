const {SHA256,MD5}=require("crypto-js");
const Gene=require("./gene");
const Solana=require("../lib/solana");
const DB=require("../lib/db");
const Cache=require("./cache");

const self={
    getSigner:(accounts)=>{
        //console.log(accounts);
        for(let i=0;i<accounts.length;i++){
            const row=accounts[i];
            if(row.signer) return row.pubkey.toString();
        }
        return false;
    },
    checkSignature:(signature,ck)=>{
        Solana.getTransaction(signature,(data)=>{
            if(data===null) return ck && ck({error:"Invalid signature."});
            const owner=self.getSigner(data.transaction.message.accountKeys);

            const start=data.slot,end=start+66;
            Solana.getSlotHash(start,(hash_start)=>{
                if(hash_start.error) return ck && ck(hash_start);

                Solana.getSlotHash(end,(hash_end)=>{
                    if(hash_end.error) return ck && ck(hash_end);

                    const hash =`0x${SHA256(signature + hash_start + hash_end).toString()}`;
                    
                    return ck && ck(hash,owner);

                });
            });
        });
    },
    record:async (name,signature,owner,ck)=>{
        const wallet=Solana.getWallet("./lib/private_key.json");
        const program=await Solana.getContract(wallet);
        const m5=MD5(name+signature).toString();

        const final = await program.methods
            .approve(m5,name,signature,owner)
            .accounts({
                payer: wallet.publicKey,
            })
            .rpc()
            .catch((err)=>{
                return ck && ck({error:err});
            })

        if(final!==undefined) return ck && ck(final);
    },
}

const Signature={
    check:(name,signature,ck)=>{
        console.log(name,signature);
        const result={
            win:false,          //wether winner
            record:"",          //record signature
            amount:0,           //LUCK token amount
        }
        //0.input check
        //0.1. wether invalid name
        Cache.get(name,(raw)=>{

            if(raw===null){
                result.error="No such gene.";
                return ck && ck(result);
            }

            //0.2.wether invalid signature
            if(!Solana.validSignature(signature)){
                result.error="Invalid signature string.";
                return ck && ck(result);
            }

            //0.3.wether duplicate request
            DB.signature.exsist(signature,name,(ns)=>{
                //console.log(`exsist?`+ns);
                if(ns.error){
                    result.error=ns.error;
                    return ck && ck(result);
                }

                if(ns===true){
                    result.error="Duplication request of this signature";
                    return ck && ck(result);
                }

                // 1.Signature status update
                // 1.1. save request signature to redis
                DB.signature.add(signature,name,(added)=>{
                    if(added.error){
                        result.error=ns.error;
                        return ck && ck(result);
                    }

                    //2.check token minting status
                    //2.1.confirm signature on Solana network
                    self.checkSignature(signature,(hash,owner)=>{
                        if(hash.error){
                            result.error=hash.error;
                            return ck && ck(result);
                        }

                        //2.2.check win result, then mint out token
                        const tpl=Gene.convert(raw.data);
                        if(!Gene.win(hash,tpl)){
                            result.error="No winner signature.";
                            DB.signature.update(signature,name,DB.status("lose"),(res)=>{
                                return ck && ck(result);
                            });
                        }
                        
                        //2.3.call LuckySig program `record`, approve to win token
                        console.log(`Ready to record:`,name,signature,owner);
                        self.record(name,signature,owner,(final)=>{
                            if(final.error){
                                result.error=final.error;
                                return DB.signature.update(signature,name,DB.status("failed"),(res)=>{
                                    return ck && ck(result);
                                });
                            }

                            result.record=final;
                            result.win=true;

                            //2.4.update signature record on server
                            DB.signature.update(signature,name,DB.status("win"),(res)=>{
                                return ck && ck(result);
                            });
                        });
                    });
                });
            });
        });
    },
    
    exsist:(name,signature,ck)=>{

    },
};

module.exports = Signature;