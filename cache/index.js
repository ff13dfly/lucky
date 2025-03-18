const { config } = require("./config.js");
const Solana=require("./lib/solana.js");
const tools=require("./lib/tools.js");
const {output}=require("./lib/output.js");
const AutoCache=require("./system/autocache.js");
const Block=require("./system/block.js");

let server=null;
const self = {
    init:(ck)=>{
        // AutoCache((msg)=>{
        //     if(msg.error){
        //         output(msg.error,"error");
        //     }else{
        //         output(msg);
        //     }
        // });
        return ck && ck();
    },
    run:(cfg, ck)=>{
        if(server !=null) return ck && ck();
        server = app.listen(cfg.port, function() {
            const host = server.address().address;
            const port = server.address().port;

            output(`\n******************************************************************************************`,"success",true);
            output(`LuckySig cache service start at http://${host}:${port}`,"success",true);
            output(`Author: Fuu, copyright 2025.`,"success",true);
            output(`******************************************************************************************`,"success",true);
            //console.log("Faucet server start at http://%s:%s", host, port);
            return ck && ck();
        });
    },
    getSlots:(input)=>{
        if (input.includes('_')) {
            return input.split('_').map(Number);
        }
        return [Number(input)];
    },
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
        //http://127.0.0.1:9666/block/351668465
        app.get("/block/:slot",(req, res)=>{
            const str=req.params.slot;
            const slots=self.getSlots(str);
            //console.log(slots);
            Block(slots,(map)=>{
                res.send(JSON.stringify(map));
            });
        });

    });
});