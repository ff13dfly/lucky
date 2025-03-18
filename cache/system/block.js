const Solana=require("../lib/solana");
const DB=require("../lib/db");
const {config}=require("../config");
const IO=require("../lib/file");
const {output} =require("../lib/output");

let cache=null;
let ticktack=null;
const self={
    recover:(ck)=>{
        if(cache!==null) return ck && ck();
        cache={};
        const target=config.file.name;
        IO.read(target,(res)=>{
            if(res.error){
                IO.save(target,"{}",()=>{
                    self.watchdog(target);
                    return ck && ck();
                });
            }else{
                cache=res;          //recover data
                self.watchdog(target);
                return ck && ck();
            }
        },true);
    },
    watchdog:(target)=>{
        if(ticktack!==null) clearInterval(ticktack);
        ticktack=setInterval(()=>{
            const str=JSON.stringify(cache);
            IO.save(target,str,()=>{
                output(`Backup cache successfully, length: ${str.length.toLocaleString()}`,"success");
            });
        },config.file.interval);
    },
    getByDB:(block,ck)=>{
        DB.slot.get(block,(res)=>{
            if(res!==null) return ck && ck(res);

            Solana.getSlotHash(block,(hash)=>{
                if(hash.error) return ck && ck(hash);
                DB.slot.set(block,hash,(res)=>{
                    if(res.error) return ck && ck(res);
                    return ck && ck(hash);
                });
            });
        });
    },
    getByCache:(block,ck)=>{
        return self.recover(()=>{
            if(cache!==null && cache[block]!==undefined) return ck&&ck(cache[block]);
            Solana.getSlotHash(block,(hash)=>{
                if(hash.error) return ck && ck(hash);
                cache[block]=hash;
                return ck && ck(hash);
            })
        });
    },
    getSlot:(block,ck)=>{
        //console.log(config);
        if(config && config.redis){
            return self.getByDB(block,ck);
        }else{
            return self.getByCache(block,ck);
        }
    },
}

const Block=(arr,ck, map)=>{
    if(map===undefined) map={};
    if(arr.length===0) return ck && ck(map);
    const slot=arr.pop();
    return self.getSlot(slot,(hash)=>{
        if(hash.error){
            map[slot]=null;
        }else{
            map[slot]=hash;
        }
        return Block(arr,ck, map);
    });
};

module.exports = Block;