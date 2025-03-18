const redis = require('redis');
const client = redis.createClient();
client.connect();

const config={
    signature:"sign_entry",
    prefix:{
        account:"acc_",         //acc_name:[ SIGNATURE ... ]
        name:"nn_",             //Gene name to check   
        counter:"cnt_",         //counter_name: 23
        signature:"sign_",      // signature:{name:status}
        spam:"spp_",
    },
    expire:180,                 //spam expire
    slotExpire:7*24*3600,       //slot data expired            
};

const STATUS={
    "win":8,           //winner
    "lose":1,          //not winner
    "failed":4,        //faild
    "pending":2,
    "init":0,
}

const DB={
    //saving all request signature to avoid multi 
    //signature data action
    status:(type)=>{
        if(!type || !STATUS[type]) return ck && ck({error:"Invalid type of status."});
        return STATUS[type];
    },
    signature:{
        get:(hash,ck)=>{
            const main=config.signature;
            client.hGet(main,hash).then((res,err) => {
                //console.log(res);
                if(err) return ck && ck({error:"Failed to read record."});
                if(res===null) return ck && ck({error:"No record of "+ hash});

                try {
                    const obj=JSON.parse(res);
                    return ck && ck(obj);
                } catch (error) {
                    //console.log("here?",error)
                    client.hDel(main,hash);
                    return ck && ck({error:"Failed to parse json string, removed"});
                }
            });
        },
        exsist:(hash,name,ck)=>{
            const main=config.signature;
            client.hGet(main,hash).then((res,err) => {
                if(err) return ck && ck({error:"Failed to read record."});
                if(res===null) return ck && ck(false);
                try {
                    const obj=JSON.parse(res);
                    //console.log(obj);
                    return ck && ck(obj[name]!==undefined);
                } catch (error) {
                    return ck && ck(false);
                }
            });
        },
        update:(hash,name,status,ck)=>{
            DB.signature.get(hash,(dt)=>{
                if(dt.error) return ck && ck(dt);
                if(dt[name]===undefined) return ck && ck({error:"Invalid name."});
                if(dt[name]===status) return ck && ck({error:"Already set."});
                dt[name]=status; 

                const main=config.signature;
                client.hSet(main,hash,JSON.stringify(dt)).then((res,err) => {
                    if(err) return ck && ck({error:"Failed to set hash map"});
                    ck && ck(true);
                });
            });
        },
        add:(hash,name,ck)=>{
            const main=config.signature;
            client.hExists(main,hash).then((res,err) => {
                if(res!==false){
                    try{
                        const obj=JSON.parse(res);
                        if(obj[name]!==undefined) return ck && ck({error:"Name exsist."});

                        obj[name]=STATUS.init;
                        client.hSet(main,hash,JSON.stringify(obj)).then((dt,err) => {
                            if(err) return ck && ck({error:"Failed to set hash map"});
                            ck && ck(true);
                        });
                    } catch(error) {
                        client.hDel(main,hash);
                        return ck && ck({error:"Failed to parse json string, removed"});
                    }
                }else{
                    const obj={}
                    obj[name]=STATUS.init;
                    client.hSet(main,hash,JSON.stringify(obj)).then((dt,err) => {
                        if(err) return ck && ck({error:"Failed to set hash map"});
                        ck && ck(true);
                    });
                }
            });
        },
    },
    //
    account:{
        //winner transaction list
        list:(addr,name,page,ck,step)=>{
            const key=`${config.prefix.account}${addr}`;
            
        },
        page:(addr,name,ck,step)=>{
            const key=`${config.prefix.account}${addr}`;

        },
        push:(addr,name,signature,ck)=>{
            const key=`${config.prefix.account}${name}_${addr}`;
            console.log(key);
            client.lPos(key,signature).then((res,err) => {
                if(err) return ck && ck({error:"Failed to read record."});
                if(res!==null) return ck && ck({error:"Signature exsist."});

                client.lPush(key,signature).then((res,err) => {
                    if(err) return ck && ck({error:"Failed to push signatrue."});
                    return ck && ck(true);
                });
            });
        },
    },

    //API request 
    // request:{
    //     get:(spam,ck)=>{
    //         const key=`${config.prefix.spam}${spam}`;
    //         client.get(key).then((hash,err) => {
    //             if(err) return ck && ck({error:"Failed to read spam record."});
    //             DB.signature.get(hash,ck);
    //         });
    //     },
    //     set:(spam,signature,ck)=>{
    //         const key=`${config.prefix.spam}${spam}`;
    //         console.log(key);
    //         client.get(key).then((res,err) => {
    //             if(err) return ck && ck({error:"Failed to read spam record."});
    //             if(res!==null) return ck && ck({error:"Spam exsist."});
                
    //             client.set(key,signature).then((res,err) => {
    //                 if(err) return ck && ck({error:"Failed to set spam record."});
    //                 client.expire(key,config.expire).then((res,err) => {
    //                     if(err) return ck && ck({error:"Failed to set spam ttl."});
    //                     return ck && ck(true);
    //                 });
    //             });
    //         });
    //     },
    // },

    slot:{
        get:(slot,ck)=>{

        },
        add:(slot,hash,ck)=>{

        },
    },
}

module.exports = DB;