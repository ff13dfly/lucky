import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Select from 'react-select';
import { MD5 } from "crypto-js";

import Solana from "../lib/solana";
import Gene from "../lib/gene";
import config from "../config";


import { FaAngleDoubleLeft,FaAngleDoubleRight,FaDna } from "react-icons/fa";
import LuckyList from "./list";
import GeneOverview from "./genes";

let history=[];

function Search(props) {
    const size = {
        row: [12],
        left: [3,7,2],
        search: [10, 2],
        gene:[3,9],
    }

    let [input, setInput] = useState("");           //input address from url
    let [account, setAccount] = useState("");       //owner publickey
    let [list, setList] = useState([]);             //signature list
    let [before, setBefore] = useState("");         //page signature
    let [enable, setEnable] = useState({pre:false,next:false});     //"pre" and "next" button status
    let [info, setInfo]=useState("");               //"pre" | "next" button info
    let [frozen, setFrozen] = useState(true);

    let [options, setOptions] = useState([]);       //gene name list
    let [selected, setSelected] = useState(null);   //selected gene
    
    const wallet = useWallet();
    const limit = config.page.step;
    //let lock=false;   
    const self = {
        changeAccount: (ev) => {
            const acc=ev.target.value;
            setAccount(acc);

            if(Solana.validAccount(acc)){
                self.clean();
                self.update(acc,"",true);
            }
        },
        
        clickPre:()=>{
            //setFrozen(true);
            setEnable({pre:false,next:false});      //avoid more click
            setInfo("Loading...");
            history.pop();
            if(history.length <= 1 ){
                self.update(account,"",true);
            }else{
                const stamp=history[history.length-2];
                self.update(account,stamp,true);
            }
        },
        clickNext:()=>{
            //setFrozen(true);
            setEnable({pre:false,next:false});       //avoid more click
            setInfo("Loading...");
            self.update(account);
        },
        clickGenes:()=>{
            //console.log(props.dialog);
            props.dialog.show(<GeneOverview dialog={props.dialog}/>,"Gene Overview")
        },
        changeSelected:(ev)=>{
            setInput(ev.label);
            setSelected(ev.value);
            setFrozen(true);
            setTimeout(() => {
                setFrozen(false);
            }, 1000);
        },
        clean:()=>{
            history=[];
            setBefore("");
        },
        // isClaimRecord:async(name,signature)=>{
        //     const program = await Solana.getContract(wallet);
        //     const m5 = MD5(name + signature).toString();

        //     const target="claimRecord";
        //     const seeds=[m5,"claim"];

        //     const PDA=Solana.getPDA(seeds,program.programId);
        //     try {
        //         const data =await program.account[target].fetch(PDA);
        //         return data;
        //     } catch (error) {
        //         return {error:"No record on chain."}
        //     }
        // },
        update: async (acc,stamp,skip) => {
            const data = await Solana.recentTxs(acc, stamp===undefined?before:stamp,limit);
            if (data.error) return false;
            if(data.length===0)return false;
            
            const last = data[data.length - 1];
            if(!skip){
                history.push(last.signature);
            }

            // for(let i=0;i<data.length;i++){
            //     console.log(data[i]);
            // }
                
            setBefore(last.signature);
            setList(data);

            enable.next=data.length<limit?false:true;
            enable.pre=history.length<=1?false:true;
            setEnable(JSON.parse(JSON.stringify(enable)));
            setInfo("");

            setFrozen(false);
        },
        
        fresh: () => {
            Gene.list((map) => {
                const arr = [];
                for (let k in map) arr.push({
                    value: map[k].data.cid,
                    label: k,
                    image:`${window.location.origin}/image/solscan.png`,
                });

                setInput(arr.length===0?"":arr[0].label);
                setOptions(arr);
                setSelected(arr[0].value);
            });
        },
        getAccount:()=>{
            if(window.location.pathname && window.location.pathname.length!==1){
                const input=window.location.pathname.slice(1);
                if(Solana.validAccount(input)) return input;
            }
            if (wallet.publicKey !== null) return  wallet.publicKey.toString();    
            return false
        },
    }

    useEffect(() => {
        if (options.length === 0) self.fresh();
        //console.log(MD5("abc").toString())
        //test account
        //4PkiqJkUvxr9P8C1UsMqGN8NJsUcep9GahDRLfmeu8UK
        const acc=self.getAccount();
        if(acc!==false){
            setAccount(acc);
            setTimeout(() => {
                self.update(acc);
            }, 1000);
        }
    }, [wallet.publicKey]);

    return (
        <Row >
            <Col sm={size.search[0]} xs={size.search[0]}>
                <Row>
                    <Col className="pt-2" sm={size.left[0]} xs={size.left[0]}>
                        <Row>
                            <Col className="" sm={size.gene[0]} xs={size.gene[0]}>
                                <button className="btn btn-md btn-dark" onClick={(ev)=>{
                                    self.clickGenes();
                                }}>
                                    <FaDna size={20}/>
                                </button>
                            </Col>
                            <Col sm={size.gene[1]} xs={size.gene[1]}>
                                <Select
                                    className="text-dark"
                                    placeholder="Select gene..."
                                    options={options}               //list of gene
                                    disabled={frozen}
                                    defaultValue={selected}
                                    value={selected}
                                    inputValue={input}
                                    onChange={(ev)=>{
                                        self.changeSelected(ev);
                                    }}
                                    onFocus={(ev)=>{
                                        setInput("");
                                    }}
                                    onInputChange={(ev)=>{
                                        setInput(ev);
                                    }}
                                />
                            </Col>
                        </Row>
                    </Col>

                    <Col className="pt-2" sm={size.left[1]} xs={size.left[1]}>
                        <input
                            type="text"
                            className="form-control"
                            disabled={frozen}
                            value={account}
                            placeholder="Input your account to check."
                            onChange={(ev) => {
                                self.changeAccount(ev)
                            }}
                        />
                    </Col>
                    <Col className="pt-2 text-end" sm={size.left[2]} xs={size.left[2]}>
                    </Col>
                </Row>
            </Col>

            <Col className="text-end pt-2" sm={size.search[1]} xs={size.search[1]}>
                <span className="pr-2">{info}</span>
                <button
                    hidden={before === ""}
                    className="btn btn-md btn-dark pr-2"
                    
                    disabled={frozen || !enable.pre}
                    onClick={(ev) => {
                        //self.clickSearch(account)
                        self.clickPre();
                    }}
                ><FaAngleDoubleLeft size={20}/></button>
                <button
                    hidden={before === ""}
                    className="btn btn-md btn-dark"
                    disabled={frozen || !enable.next}
                    onClick={(ev) => {
                        self.clickNext();
                    }}
                ><FaAngleDoubleRight size={20}/></button>
            </Col>

            <Col hidden={frozen} className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <LuckyList data={list} dialog={props.dialog} gene={selected} owner={account}/>
            </Col>
            <Col hidden={!frozen} className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <h4>Loading...</h4>
            </Col>
        </Row>
    )
}

export default Search;