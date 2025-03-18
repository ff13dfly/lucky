const { config } = require("./config.js");
const tools=require("./lib/tools.js");
const Signature=require("./system/signature.js");
const Cache=require("./system/cache.js");
const { output } =require("./lib/output.js");
const Gene=require("./system/gene.js");

let server=null;
const self = {
    init:(ck)=>{
        
        return ck && ck();
    },
    cache:(ck)=>{
        //1.get the list of LuckySig
        //output(`Start to get the LuckySig from Solana network.`);
        Cache.auto((res)=>{


            //2.get the data of LuckySig from Solana and save to local redis
            //output(`Start to cache LuckySig genes.`);

            return ck && ck();
        });
    },
    run:(cfg, ck)=>{
        if(server !=null) return ck && ck();
        server = app.listen(cfg.port, function() {
            const host = server.address().address;
            const port = server.address().port;

            output(`\n******************************************************************************************`,"success",true);
            output(`LuckySig approver service start at http://${host}:${port}`,"success",true);
            output(`Author: Fuu, copyright 2025.`,"success",true);
            output(`******************************************************************************************`,"success",true);
            
            self.cache(ck);
        });
    }
}

const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
if(config.debug) app.use(cors());

//catch error in order to avoid crashing.
process.on("unhandledRejection", (reason, promise) => {
    console.log(reason);
    output(`UnhandledRejection`,"error");
});
  
process.on("uncaughtException", (error) => {
    console.log(error);
    output(`uncaughtException`,"error");
});


self.init(()=>{
    self.run(config.server, ()=>{
        
        app.get("/",(req, res)=>{
            res.send("");
        });

        app.get("/ping",(req, res)=>{
            const info={
                system:"LuckySig Minter",
                version:"0.0.1",
                stamp:tools.stamp(),
            }
            res.send(info);
        });

        //get name list of all luckySig
        //http://localhost:7744/list
        app.get("/list",(req, res)=>{
            res.send(Cache.list());
        });

        //get CID of template by name
        //http://localhost:7744/hello
        app.get("/:name",(req, res)=>{
            //1.update name list from gene list account
            const name=req.params.name;

            Cache.get(name,(dt)=>{
                res.send(dt===null?{error:"Invalid name"}:Gene.convert(dt.data));
            });
            
        });

        app.get("/search/:cid",(req, res)=>{
            const cid=req.params.cid;
            const search=Cache.search(cid);
            if(search===false){
                res.send({error:"Invalid gene CID."})
            }else{
                res.send({name:search})
            }
        });
        
        //http://localhost:7744/hello/PnrX8wj5rJibT95XVW5F9Q9T7RnK6qhJ5ZrBFL6ir9121fVqKrV92uRtKWAno9dm1PTRBLAsAnbVJ8PciEJmqeN
        //check wether winner by name and signature
        app.get("/:name/:signature",(req, res)=>{
            const signature=req.params.signature;
            const name=req.params.name;
            Signature.check(name,signature,(result)=>{
                res.send(result);
            });
        });
    });
});