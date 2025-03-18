const Solana=require("../lib/solana");
const DB=require("../lib/db");

const config={
    interval:500,
}

const self={
    getSlots:(done,step,ck,count)=>{
        if( count===undefined ) count=0;
        if( count === step ){
            ck && ck(done-count);
            return setTimeout(()=>{
                return self.getSlots(done-count,step,ck);
            },config.interval);
        }

        const block=done-count;
        Solana.getSlotHash(block,(hash)=>{
            if(hash.error) return ck && ck(hash);
            DB.slot.set(block,hash,(res)=>{
                if(res.error) return ck && ck(res);
                count++;
                return self.getSlots(done,step,ck,count);
            });
        });
    },
}

const AutoCache=(ck)=>{
    DB.start.get(async (start)=>{
        console.log(start);
        if(start.error) return ck && ck(start);
        if(start.milestone===0){
            Solana.getCurrentSlot((block)=>{
                start.milestone=block;
                start.done=block;
                DB.start.set(start,(res)=>{
                    if(res.error) return ck && ck(res);
                    ck && ck(JSON.stringify(start));

                    self.getSlots(start.done,start.step,(block)=>{
                        ck && ck(`Cache block hash to ${block+1}`);

                        start.done=block;
                        DB.start.set(start,(res)=>{
                            if(res.error) return ck && ck(res);
                            ck && ck(`Start tag is updated.`);
                        });
                    });
                });
            });
        }else{
            self.getSlots(start.done,start.step,(block)=>{
                ck && ck(`Cache block hash to ${block+1}`);

                start.done=block;
                DB.start.set(start,(res)=>{
                    if(res.error) return ck && ck(res);
                    ck && ck(`Start tag is updated.`);
                });
            });
        }
    });
}

module.exports = AutoCache;