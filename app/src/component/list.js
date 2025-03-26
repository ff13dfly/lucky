import { Row, Col, Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import { SHA256 } from "crypto-js";

import TPL from "../system/tpl";
import Render from "../system/render";
import Approver from "../lib/approver";
import Cache from "../lib/cache";
import tools from "../system/tools";
import Gene from "../lib/gene";

import Details from "./details";

import { FaMapSigns } from "react-icons/fa";

function LuckyList(props) {
    const size = {
        row: [12],
        left: [9,3],
        grid:[2],
    }

    let [list, setList] = useState([]);
    let [template, setTemplate]= useState(null);

    const gene=props.gene;
    
    const self = {
        clickApprove:(signature)=>{
            //console.log(signature);
            Approver.check(signature,(res)=>{
                console.log(res);
            });
        },
        clickSignagture:(signature,slot,hash)=>{
            
            props.dialog.show(<Details 
                dialog={props.dialog} 
                signature={signature} 
                slot={slot} 
                gene={gene}
                win={self.win(hash)}
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
            const arr=[block,block+66];
            Cache(arr,(map)=>{
                //console.log(map);
                if(map===false) return ck && ck(false);
                const hash=`0x${SHA256(signature + map[block] + map[block+66]).toString()}`;
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
        freshSignatures:async (arr, tpl ,ck, index) => {
            if(index===undefined) index=0;
            if(!arr[index]) return ck && ck();
            const row=arr[index];
            self.getMulti(row.slot,row.signature,(hash)=>{
                index++;
                if(hash===false){
                    row.pending=true;
                    return self.freshSignatures(arr, tpl, ck, index);
                } 
                Render.thumb(hash, tpl.image, tpl.parts, tpl.basic, [], (bs64) => {
                    row.hash=hash;
                    row.thumb=bs64;
                    setList(tools.clone(arr));
                    return self.freshSignatures(arr, tpl, ck, index);
                });
            });
        },
        win:(hash)=>{
            //console.log(template);
            if(template===null) return false;
            if(!template.series) return false;
            const arr= Gene.win(hash,template.parts,template.series);
            //console.log(arr);
            return arr[0];
        },
    }

    useEffect(() => {
        // console.log(gene);
        if (props.data.length !== 0 && props.gene) {
            console.log(props);
            setList(props.data);
            self.getGene(gene, (ge) => {
                setTemplate(ge);
                self.freshSignatures(props.data, ge, () => {
                    //setReady(true);
                    //setList(arr);
                });
            });
        }

    }, [props.data,props.gene]);

    return (
        <Row hidden={list.length === 0} >
            {list.map((row, index) => (
                <Col className="pt-3" key={index} sm={size.grid[0]} xs={size.grid[0]}>
                    <Card 
                        hidden={!row.hash} 
                        style={{ width: "100%" }} 
                        className={(row.hash && self.win(row.hash))?"background-purple point shake":"background-purple point"}
                    >
                        <Card.Img variant="top"  src={row.thumb} onClick={(ev)=>{
                            self.clickSignagture(row.signature,row.slot, row.hash);
                        }}/>
                        <Row className="pb-2">
                            <Col className="text-center pt-2" style={{color:"#FFFFFF"}} sm={size.row[0]} xs={size.row[0]}>
                                <FaMapSigns className="pr-2" size={18}/>
                                <strong className="pt-1">{row.slot.toLocaleString()}</strong>
                            </Col>
                        </Row>
                    </Card>
                    <Card hidden={row.hash} style={{ width: "100%" }}>
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