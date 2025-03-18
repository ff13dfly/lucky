const file=require("../lib/file");

const self={
    getCID:(uri)=>{
        return uri.split("https://")[1].split(".")[0];
    },
}

const Gene={
    get:(name,ck)=>{
        console.log(`name:${name}`);
        file.read(`./gene/${name}.json`,(res)=>{
            if(res.error) return ck && ck(res);
            return ck && ck(res);
        },true);
    },
    win:(hash,tpl)=>{
        if(!hash || !tpl) return false;
        
        //TODO, here to check wether airdrop the token

        return true;
    },

    //convert gene raw data from on-chain to normal
    convert:(data)=>{
        const {basic,parts,series,raw}=data;
        const [size,grid,cell]=basic;
        const tpl={
            size:size,
            cell:cell,
            grid:grid,
            parts:[],
            series:series,
            cid:self.getCID(raw),
        }
    
        for(let i=0;i<parts.length;i++){
            const [value,img,pos,rarity]=parts[i];
            tpl.parts.push({
                value:value,
                img:img,
                position:pos,
                center:[0,0],
                rotation:[0],
                rarity:rarity,
            });
        }

        return tpl;
    },
}
module.exports = Gene;