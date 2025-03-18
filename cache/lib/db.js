
//const dotenv =require('dotenv');
const redis = require('redis');
const tools=require("./tools");
const setting=require("../config");
const config={
    entry:"sol_slot",
    stamp:"cache_stamp",
    expire:7*24*3600,           //slot cache expired setting
    start:{
        done:0,         //slot number of cached
        milestone:0,    //cache start slot number
        step:10,        //number of step to cache data
        interval:500,   //reget slot hash interval
    },
};

//console.log(setting);

let client=null;
const init=async ()=>{
    //FIXME, redis did not work properly.
    //if(!setting.config.debug){
        //redis-cli -u redis://lucky:pas333@localhost:6379
        //client = redis.createClient({url:"redis://default:xxc33BBiuDx@localhost:6379"});
        //client = redis.createClient({password:"xxc33BBiuDx"});
    //}else{
        //client = redis.createClient();
    //}
    client = redis.createClient();
    await client.connect();
}
if(setting.config.redis) init();

const DB={
    start:{
        get:(ck)=>{
            const key=config.stamp;
            client.get(key).then((res,err) => {
                if(err) return ck && ck({error:"Failed to get start record."});
                if(res===null){
                    const data=tools.clone(config.start);
                    client.set(key,JSON.stringify(data)).then((res,err) => {
                        if(err) return ck && ck({error:"Failed to set start record."});
                        return ck && ck(data);
                    });
                }else{
                    try {
                        const data=JSON.parse(res);
                        return ck && ck(data);
                    } catch (error) {
                        client.del(key).then((res,err) => {
                            
                        });
                        return ck && ck({error:"Failed to parse record."});
                    }
                }
            });
        },
        set:(obj,ck)=>{
            const key=config.stamp;
            client.set(key,JSON.stringify(obj)).then((res,err) => {
                if(err) return ck && ck({error:"Failed to set start record."});
                return ck && ck(true);
            });
        },
    },
    slot:{
        set:(slot,hash,ck)=>{
            const main=config.entry;
            client.hSet(main,slot,hash).then((res,err) => {
                if(err) return ck && ck({error:"Failed to set slot record."});
                return ck && ck(true);
            });
        },
        get:(slot,ck)=>{
            const main=config.entry;
            client.hGet(main,""+slot).then((res,err) => {
                if(err) return ck && ck({error:"Failed to set slot record."});
                return ck && ck(res);
            });
        },
    }
}

module.exports = DB;