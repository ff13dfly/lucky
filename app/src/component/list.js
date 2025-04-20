import { Row, Col, Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import { SHA256,MD5} from "crypto-js";
import { useWallet } from "@solana/wallet-adapter-react";

import Solana from "../lib/solana";
import TPL from "../system/tpl";
import Render from "../system/render";
import Approver from "../lib/approver";
import Cache from "../lib/cache";
import tools from "../system/tools";
import Gene from "../lib/gene";

import Details from "./details";

import { FaMapSigns } from "react-icons/fa";

/* Single signature detail page
*   @param  {object[]}      data       //force to fresh function
*   @param  {string}        gene       //gene cid
*   @param  {string}        owner      //signature owner
*   @param  {function}      dialog    //system dialog function
*/
function LuckyList(props) {
    const size = {
        row: [12],
        left: [9,3],
        grid:[2],
    }

    let [list, setList] = useState([]);
    let [template, setTemplate]= useState(null);

    const wallet = useWallet();
    const offset=66;
    const self = {
        clickApprove:(signature)=>{
            //console.log(signature);
            Approver.check(signature,(res)=>{
                console.log(res);
            });
        },
        clickSignagture:(signature,slot,win)=>{
            props.dialog.show(<Details 
                dialog={props.dialog} 
                signature={signature} 
                slot={slot} 
                gene={props.gene}
                owner={props.owner}
                win={win}
            />, "LuckySig Details" );
        },
        getGene: (id, ck) => {
            TPL.view(id, (dt) => {
                if (dt === false) return ck && ck({ error: "Invalid gene template" });
                const basic = {
                    cell: dt.cell,
                    grid: dt.grid,
                    target: dt.size
                }
                return ck && ck({
                    basic: basic,
                    parts: dt.parts,
                    image: dt.image,
                    series: dt.series,
                });
            });
        },
        getMulti:(block,signature,ck)=>{
            const arr=[block,block+offset];
            Cache(arr,(map)=>{
                if(map===false) return ck && ck(false);
                const hash=`0x${SHA256(signature + map[block] + map[block+offset]).toString()}`;
                return ck && ck(hash);
            });
        },
        
        getSignatures: async (arr, tpl ,ck, signs) => {
            if (signs === undefined) signs = [];
            if (arr.length === 0) return ck && ck(signs);
            const row = arr.shift();

            self.getMulti(row.slot,row.signature,(hash)=>{
                
                if(hash===false) return self.getSignatures(arr, tpl, ck, signs);

                Render.thumb(hash, tpl.image, tpl.parts, tpl.basic, [], (bs64) => {
                    const atom = {
                        signature: row.signature,
                        slot: row.slot,
                        hash: hash,
                        thumb: bs64,
                    }
                    signs.push(atom);
                    return self.getSignatures(arr, tpl, ck, signs);
                });
            });
        },
        isClaimRecord:async(name,signature)=>{
            const program = await Solana.getContract(wallet);
            const m5 = MD5(name + signature).toString();

            const target="claimRecord";
            const seeds=[m5,"claim"];

            const PDA=Solana.getPDA(seeds,program.programId);
            try {
                const data =await program.account[target].fetch(PDA);
                return data;
            } catch (error) {
                return {error:"No record on chain."}
            }
        },
        freshSignatures:async (arr, tpl, name ,ck, index) => {
            if(index===undefined) index=0;
            if(!arr[index]) return ck && ck();
            const row=arr[index];   
            self.getMulti(row.slot,row.signature,async (hash)=>{
                index++;
                if(hash===false){
                    row.pending=true;
                    return self.freshSignatures(arr, tpl,name, ck, index);
                }

                if(self.win(hash,tpl)){
                    row.win=true;
                    const claimed=await self.isClaimRecord(name,row.signature);
                    row.claimed = claimed.done?true:false;
                }else{
                    row.win=false;
                }
                
                Render.thumb(hash, tpl.image, tpl.parts, tpl.basic, [], (bs64) => {
                    row.hash=hash;
                    row.thumb=bs64;
                    setList(tools.clone(arr));
                    return self.freshSignatures(arr, tpl,name, ck, index);
                });
            });
        },
        win:(hash,tpl)=>{
            //console.log(tpl);
            if(tpl===null || !tpl) return false;
            if(!tpl.series) return false;
            const arr= Gene.win(hash,tpl.parts,tpl.series);
            return arr[0];
        },
        getClass:(win,claimed)=>{
            let cls="pointer shadow ";
            if(win){
                cls+="background-green "
                if(!claimed) cls+="shake"
            }else{
                cls+="background-purple "
            }
            return cls;
        },
    }

    useEffect(() => {
        console.log(SHA256("hell0").toString());
        setList(props.data);
        if (props.data.length !== 0 && props.gene) {
            Gene.search(props.gene,(dt)=>{
                if(dt.error) return false;
                //console.log(dt);
                self.getGene(props.gene, (ge) => {
                    setTemplate(ge);
                    self.freshSignatures(props.data, ge, dt.name, () => {
    
                    });
                });
            });
            
        }
    }, [props.data,props.gene,props.owner]);

    return (
        <Row hidden={list.length === 0} >
            {list.map((row, index) => (
                <Col className="pt-3" key={index} sm={size.grid[0]} xs={size.grid[0]}>
                    <Card hidden={!row.hash} style={{ width: "100%" }} className={self.getClass(row.win,row.claimed)}>
                        <Card.Img variant="top"  src={row.thumb} onClick={(ev)=>{
                            self.clickSignagture(row.signature,row.slot,row.win);
                        }}/>
                        <Row className="pb-2">
                            <Col className="text-center pt-2" style={{color:"#FFFFFF"}} sm={size.row[0]} xs={size.row[0]}onClick={(ev)=>{
                                self.clickSignagture(row.signature,row.slot,row.win);
                            }}>
                                <FaMapSigns className="pr-2" size={18}/>
                                <strong className="pt-1">{row.slot.toLocaleString()}</strong>
                            </Col>
                        </Row>
                    </Card>
                    <Card hidden={row.hash} style={{width: "100%",background:"#000000"}}>
                        <Card.Img variant="top" src={`${window.location.origin}/image/holding.png`} />
                        <Row className="pb-2">
                            <Col className="text-center pt-2" style={{color:"#FFFFFF"}} sm={size.row[0]} xs={size.row[0]}>
                                <FaMapSigns className="pr-2" size={18}/>
                                <strong className="pt-1">{row.slot.toLocaleString()}</strong>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            ))}
        </Row>
    )
}

export default LuckyList;