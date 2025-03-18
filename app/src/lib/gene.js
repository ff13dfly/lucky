import config from "../config";

const self={
    call:(method,ck)=>{
        const url=`${config.service.approver}/${method}`;
        console.log(url);
        fetch(url)
            .then(( response )=>{
                if(!response.ok) return ck && ck({error:"Invid response."});
                response.text().then((res)=>{
                    try {
                        const dt=JSON.parse(res);
                        return ck && ck(dt);
                    } catch (error) {
                        return ck && ck({error:"Invalide content, please chech the response from server."})
                    }
                });
            })
            .catch((error)=>{
                console.log(error);
            });
    },
}

const Gene={
    list:(ck)=>{
        self.call("list",ck);
    },
    
    //Get the gene name via CID
    search:(cid,ck)=>{
        self.call(`search/${cid}`,ck);
    },

    win:(hash,parts,series)=>{
        //console.log(hash,parts,series);
        const arr=[];
        const pure=hash.slice(2);
        for(let i=0;i<series.length;i++){
            for(let j=0;j<parts.length;j++){
                const row=parts[j];
                if(!row.rarity[i]){
                    arr[i]=false;
                    break;
                }
                const rarity=row.rarity[i];
                //console.log(rarity);
                const [start,step,divide,offset]=row.value;
                const val=parseInt(`0x${pure.slice(start,start+step)}`);
                //console.log(val);
                //console.log(row.value)
                const selected=(val+offset)%divide;
                //console.log(selected,rarity)
                if(!rarity.includes(selected)) arr[i]=false;
            }

            if(arr[i]===undefined) arr[i]=true;     //如果没报错，就是符合要求的
        }
        return arr;
    },
}

export default Gene;