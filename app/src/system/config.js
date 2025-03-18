/* 
*  iNFT market system config
*  @auth [ Fuu ]
*  @creator Fuu
*  @date 2024-07-01
*  @functions
*  1.unique config setting here.
*  2.encried local saving support.
*/

import tools from "./tools";
import Encry from "./encry";

//using account address (password optional) to encry the setting to localstorage
const metadata={
    address:"",
    pass:"",
}
let cache=null;         //setting cache, if no setting, keep null

const config={
    system:{        //this part will be written to localstorage
        name:"iNFT Market",         //dApp name needed for wallet
        prefix:"imxt",              //prefix of localstorage
        key:"local_setting",        //default local setting key
        avatar:{
            base:"https://robohash.org",
            set:"?set=set2",
        },
    },
    runtime:{
        template:{
            default:"bafkreiddy2rqwebw5gm5hdqqqrbsqzkrubjk3ldzr2bia5jk4w5o2w5w4i",
            orgin:"web3.storage",
        }
    },
    storage:{     
        DBname:"luckDB",
        password:"",                //password for image cache
        enable:{
            template:true,          //enable cache template
            iNFT:true,              //enable cache iNFT thumb
            encry:false,            //wether encry the image bs64 data
        },
        tables:{
            template:{
                keyPath: "cid",
                map: {
                    cid: { unique: true },
                    stamp: { unique: false },
                    thumb: { unique: false },
                    image: { unique: false },
                    content: { unique: false },
                },
                step:10,
            },
            infts:{
                keyPath:"name",
                map:{
                    name: { unique: true },
                    stamp: { unique: false },
                    thumb: { unique: false },
                },
            },    
            gene:{
                keyPath:"name",
                map:{
                    name:{ unique: true },          //
                    image:{unique:false},           //the editing image data will be saved as cache
                    size:{unique:false},
                    cell:{unique:false},
                    grid:{unique:false},
                    series:{unique:false},
                    parts:{unique:false},
                    deploy:{unique:false},
                    stamp:{unique:false},
                },
            },
        },
    },
    version:202401,             //setting version
}

const funs={
    /*  Set the account to check setting 
    * @param  {string}  addr     //account to get setting
    */
    set:(addr,pass)=>{
        if(addr) metadata.address=addr;
        if(pass) metadata.pass=pass;
        return true;
    },

    //get the setting key by 
    getSettingKey:(addr,pass)=>{
        if(!addr && !pass) return `${config.system.prefix}_${config.system.key}`;
        if(addr && !pass) return `${config.system.prefix}_${Encry.sha256(addr)}`;
        if(addr && pass) return config.system.prefix+"_"+Encry.sha256(`${addr}${pass}`);
        return `${config.system.prefix}_${config.system.key}`;
    },
    decodeData:(raw,addr,pass)=>{
        const offset=Encry.md5(!pass?addr:(addr+pass));
        Encry.auto(offset);
        return Encry.decrypt(raw);
    },
    encodeData:(raw,addr,pass)=>{
        const offset=Encry.md5(!pass?addr:(addr+pass));
        Encry.auto(offset);
        return Encry.encrypt(raw);
    },
}

const self={

    /* check wether setting encried localstorage
    *   @param  {string}     [addr]     //manage account
    *   @param  {string}     [pass]     //encry password
    */
    exsist:(addr,pass)=>{
        const key=funs.getSettingKey(addr,pass);
        const data=localStorage.getItem(key);
        return  data===null;
    },

    /*get the setting
    * @param    {function}  ck      //callback
    * @param    {string}    [addr]  //address to get setting
    * @param    {string}    [pass]  //password to get setting
    * return
    *   {object}  setting object
    */
    init:(ck,addr,pass)=>{
        funs.set(addr,pass);
        const status={
            first:true,
            msg:"null",
        }
        //1.check wether setting data
        const key=funs.getSettingKey(addr,pass);
        //console.log(key);
        const data=localStorage.getItem(key);
        if(data===null){
            cache=tools.clone(config);      //set default setting
            return ck && ck(status);
        }

        //2.decode encry setting;
        const str=funs.decodeData(data,addr,pass);
        if(!str){
            status.first=false;
            status.message="Invalid password or manage account.";
            cache=tools.clone(config);      //set default setting
            return ck && ck(status);
        }
        try {
            const cfg=JSON.parse(str);
            cfg.stamp=tools.stamp();        //leave a stamp to 
            cache=tools.clone(cfg);         //set customer setting
            return ck && ck(status);

        } catch (error) {
            status.first=false;
            status.message="Invalid config setting file";
            return ck && ck(status);
        } 
    },    

    /* fresh the setting
    * @param {boolean}    [force]    //force to fresh setting
    * @param {string}     [pass]     //password to fresh setting
    */
    save:()=>{
        const key=funs.getSettingKey(metadata.address,metadata.pass);
        //console.log(key);
        const dt=JSON.stringify(cache);
        if(key.length===(64+config.system.prefix.length+1)){    //check wether encried;
            const edata=funs.encodeData(dt,metadata.address,metadata.pass);
            //console.log(edata);
            localStorage.setItem(key,edata);
        }else{
            localStorage.setItem(key,dt);
        }
    },

    /*  get target value of config
    *   @param  {string | array}    path    //the path to get the value of config
    *   @param  {object}    [obj]           //for loop target, no need to input
    */
    get:(path,obj)=>{
        //1.check wether init the setting
        if(cache===null) return self.init(()=>{
            return self.get(path);
        });
        if(obj===undefined) obj=cache;
        if(!path) return tools.clone(obj);
        
        //2.saving result if the end of path
        if(Array.isArray(path)){
            if(path.length===1){
                //console.log(`here: ${!obj[path[0]]?false:tools.clone(obj[path[0]])}`)
                return !obj[path[0]]?false:tools.clone(obj[path[0]]);
            }else{
                const kk=path.shift();
                obj=obj[kk];
                return self.get(path,obj);
            }
        }else{
            return !obj[path]?false:tools.clone(obj[path]);
        }
    },

    /*  set target value of config
    *   @param  {string | array}    path    //the path to get the value of config
    *   @param  {any}               val     //value to set
    *   @param  {boolean}   [force]         //wether force to save to localstorage
    *   @param  {object}    [obj]           //for loop target, no need to input
    */  

    set:(path,val,force,obj)=>{
        //1.check wether init the setting
        if(cache===null) return self.init(()=>{
            return self.set(path,val,force);
        });

        //2.saving result if the end of path
        if(obj===undefined) obj=cache;
        if(path.length===1){
            if(!obj[path[0]]) return false;
            obj[path[0]]=val;
            if(force) self.save();
            return true;
        }

        //3.reset the point to the setting path
        const kk=path.shift();
        if(!obj[kk]) return false;
        obj=obj[kk];
        return self.set(path,val,force,obj);
    },
}

export default self;