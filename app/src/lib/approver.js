import bs58 from "bs58";
import config from "../config";

const self={
    call:(path,ck)=>{
        const uri=`${config.service.approver}/${path}`;
        console.log(uri);
        fetch(uri)
            .then(( response )=>{
                if(!response.ok) return ck && ck({error:"Invalid response."});
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
    valid:(hash)=>{
        const signatureBytes = bs58.decode(hash);
        if (signatureBytes.length !== 64) return false;
        return true;
    },
    search:(cid,ck)=>{
        const path=`search/${cid}`;
        self.call(path,ck);
    },
}

const Approver={
    check:(signature,cid,ck)=>{
        if(!self.valid(signature)) return ck && ck({error:"Invalid signatrue."});

        self.search(cid,(res)=>{
            if(res.error || !res.name) return ck && ck(res);
            const path=`${res.name}/${signature}`;
            self.call(path,ck);
        });
    },

    name:(cid,ck)=>{
        self.search(cid,ck);
    },
    
    ping:(ck)=>{
        self.call("ping",ck);
    },
}

export default Approver;