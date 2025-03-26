import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Select from 'react-select';

import Solana from "../lib/solana";
import Gene from "../lib/gene";

import { FaAngleDoubleLeft,FaAngleDoubleRight } from "react-icons/fa";

import LuckyList from "./list";

let history=[];

function Search(props) {
    const size = {
        row: [12],
        left: [3,7,2],
        search: [10, 2],
    }

    let [account, setAccount] = useState("G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN");
    let [list, setList] = useState([]);
    let [before, setBefore] = useState("");
    let [enable, setEnable] = useState({pre:false,next:false});
    let [frozen, setFrozen] = useState(false);

    let [options, setOptions] = useState([]);
    let [selected, setSelected] = useState(null);
    
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
        update: async (acc,stamp,skip) => {

            const data = await Solana.recentTxs(acc, stamp===undefined?before:stamp,18);
            //console.log(data);
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
        },
        
        fresh: () => {
            Gene.list((map) => {
                const arr = [];
                for (let k in map) arr.push({
                    value: map[k].data.cid,
                    label: k,
                    image:`${window.location.origin}/image/solscan.png`,
                });
                setOptions(arr);
                setSelected(arr[0].value);
            });
        },
    }

    useEffect(() => {
        if (options.length === 0) self.fresh();
        if (wallet.publicKey !== null) {
            const acc = wallet.publicKey.toString();
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
                        <Select
                            className="text-dark"
                            defaultValue={selected}
                            value={selected}
                            onChange={(ev)=>{
                                console.log(ev);
                                setSelected(ev.value);
                            }}
                            options={options}
                        />
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
                    className="btn btn-md btn-secondary pr-2"
                    
                    disabled={frozen || !enable.pre}
                    onClick={(ev) => {
                        //self.clickSearch(account)
                        self.clickPre();
                    }}
                ><FaAngleDoubleLeft size={20}/></button>
                <button
                    hidden={before === ""}
                    className="btn btn-md btn-secondary"
                    disabled={frozen || !enable.next}
                    onClick={(ev) => {
                        //self.clickSearch(account)
                        self.clickNext();
                    }}
                ><FaAngleDoubleRight size={20}/></button>
            </Col>

            <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                <LuckyList data={list} dialog={props.dialog} gene={selected} />
            </Col>
        </Row>
    )
}

export default Search;