const Solana=require("../lib/solana.js");
const {output}=require("../lib/output.js");
const tools=require("../lib/tools.js");

const ignore=['lucky','luck'];      //ignore name list
const gene={};                      //gene data cache

//!important, need to check the balance and send warning
//573VCwSmhKZanibsFseiy4BpGhQkUcxJv4Nnpcfx4tbP
const wallet=Solana.getWallet("./lib/private_key.json");

const info={
    RegistryName:async(ck)=>{
        const program = await Solana.getContract(wallet);
        const target="registryName";
        const seeds=["luck_mapping"];
        const PDA=Solana.getPDA(seeds,program.programId);
        const data=await program.account[target].fetch(PDA);
        return ck && ck(data);
    },
    GeneData:async(name)=>{
        const program = await Solana.getContract(wallet);
        const target="geneData";
        const seeds=["gene_storage_account",name];
        const PDA=Solana.getPDA(seeds,program.programId);
        return await program.account[target].fetch(PDA);
    },
}

const self={
    getGenes:async (list,ck,map)=>{
        if(map===undefined) map={error:[]}
        if(list.length===0) return ck && ck(map);
        const name=list.pop();
        const ge=await info.GeneData(name);
        
        ge.data=JSON.parse(ge.data);
        ge.data.cid=self.getCID(ge.data.raw);           //get cid from URI

        ge.stamp=tools.stamp();

        //TODO,here to parse out CID of gene

        map[name]=ge;
        return self.getGenes(list,ck,map);
    },
    getCID:(uri)=>{
        const bd=uri.split("https://");
        if(bd.length<2) return false;
        return uri.split("https://")[1].split(".")[0];
    },
    watchdog:async ()=>{
        const program = await Solana.getContract(wallet);
        const target="registryName";
        const seeds=["luck_mapping"];
        const PDA=Solana.getPDA(seeds,program.programId);
        output(`Start to watch on ${PDA}`);
        Solana.onChange(PDA,(res)=>{
            output(`Name list changed.`);

            //1.get name list
            info.RegistryName((names)=>{
                console.log(res);

                //2.filter out not cached name
                const todo=names.data.slice(2);
                const newer=[];
                for(let i=0;i<todo.length;i++){
                    if(!map[todo[i]]) newer.push(todo[i]);
                }

                //3. cache new data
                self.getGenes(newer,(map)=>{
                    for(let k in map){
                        if(k==="error") continue;
                        gene[k]=map[k];
                    }
                });
            });
        });
    },
};

const Cache={
    auto:(ck)=>{
        output(`Start to get the LuckySig from Solana network.`);
        info.RegistryName((names)=>{
            const todo=names.data.slice(2);
            self.getGenes(todo,(map)=>{
                for(let k in map){
                    if(k==="error") continue;
                    gene[k]=map[k];
                }
                output(`Fetched all gene data.`,"success");
                self.watchdog();
                return ck && ck();
            });
            
        });
    },
    get:(name,ck)=>{
        if(!gene[name]) return ck && ck(null);
        const single=gene[name];

        //TODO, check the fresh interval

        return ck && ck(single);
    },
    search:(cid)=>{
        for(let k in gene){
           if(cid===gene[k].data.cid) return k;
        }
        return false;
    },
    list:()=>{
        const list={};
        for(let k in gene){
            const single=gene[k];
            if(single.close) continue;      //ignore closed gene
            list[k]=single;
        }
        return list;
    },
}


module.exports = Cache;