import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Select from 'react-select';

import Solana from "../lib/solana";
import Gene from "../lib/gene";


import { FaAngleDoubleLeft,FaAngleDoubleRight,FaBars,FaDna } from "react-icons/fa";
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

    let [account, setAccount] = useState("");
    let [list, setList] = useState([]);
    let [before, setBefore] = useState("");
    let [enable, setEnable] = useState({pre:false,next:false});
    let [frozen, setFrozen] = useState(true);

    let [options, setOptions] = useState([]);
    let [selected, setSelected] = useState(null);
    let [input, setInput] = useState("");
    
    const wallet = useWallet();
    const limit=12;

    const self = {
        changeAccount: (ev) => {
            const acc=ev.target.value;
            setAccount(acc);

            if(Solana.validAccount(acc)){
                history=[];
                self.update(acc);
            }
        },
        
        clickPre:()=>{
            //setFrozen(true);
            history.pop();
            //console.log(`Click Pre button, history: ${JSON.stringify(history)}`)
            if(history.length <= 1 ){
                self.update(account,"",true);
            }else{
                const stamp=history[history.length-2];
                self.update(account,stamp,true);
            }
        },
        clickNext:()=>{
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
        update: async (acc,stamp,skip) => {
            const data = await Solana.recentTxs(acc, stamp===undefined?before:stamp,18);
            if (data.error) return false;
            if(data.length===0)return false;
            
            const last = data[data.length - 1];
            if(!skip){
                history.push(last.signature);
            }
                
            setBefore(last.signature);
            setList(data);

            enable.next=data.length<limit?false:true;
            enable.pre=history.length<=1?false:true;
            setEnable(JSON.parse(JSON.stringify(enable)));

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
    }

    useEffect(() => {
        if (options.length === 0) self.fresh();

        if(window.location.pathname && window.location.pathname.length!==1){
            const input=window.location.pathname.substr(1);
            setAccount(input);
            setTimeout(() => {
                self.update(input);
            }, 1000);
        }else{
            if (wallet.publicKey !== null) {
                const acc = wallet.publicKey.toString();
                setAccount(acc);
                setTimeout(() => {
                    self.update(acc);
                }, 1000);
            }
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

            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <LuckyList data={list} dialog={props.dialog} gene={selected} />
            </Col>
            <Col hidden={!frozen} className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <h4>Loading...</h4>
            </Col>
        </Row>
    )
}

export default Search;