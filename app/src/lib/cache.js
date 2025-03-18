import config from "../config";

const Cache=(arr,ck)=>{
    const str=arr.join("_");
    const uri=`${config.service.cache}/block/${str}`;
    //console.log(uri);
    fetch(uri).then(( response )=>{
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
        return ck && ck(false);
    });
}

export default Cache;