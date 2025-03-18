const Solana=require("../lib/solana.js");
const {output}=require("../lib/output.js");
const tools=require("../lib/tools.js");

const cfg={
    updateInterval: 2 * 3600 * 1000,    //2h就刷新数据
};

const ignore=['lucky','luck'];      //默认不使用的名称
const gene={};                      //缓存gene的数据

//573VCwSmhKZanibsFseiy4BpGhQkUcxJv4Nnpcfx4tbP
const wallet=Solana.getWallet("./lib/private.json");

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
            //console.log(single);
            if(single.close) continue;      //ignore closed gene
            list[k]=single;
        }

        //list.pubkey=wallet.publicKey.toString();
        return list;
    },
}


module.exports = Cache;