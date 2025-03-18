import { Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import Lucky from "../lib/lucky";
import TPL from "../system/tpl";

function Portal(props) {
    const size = {
        row: [12],
        left:[9,3],
        ipfs:[8,4],
    }

    let [ inited, setInited ] = useState(false);
    let [ raw, setRaw ]= useState("");

    let [ createName, setCreateName ]= useState("");
    let [ actionName, setActionName ]= useState("");
    let [ cid, setCID]= useState("");

    const wallet = useWallet();
    const self={
        changeActoinName:(ev)=>{
            setActionName(ev.target.value);
        },
        changeCreateName:(ev)=>{
            setCreateName(ev.target.value);
        },
        changeCID:(ev)=>{
            setCID(ev.target.value)
        },
        clickInit:(ev)=>{
            const recipient = "G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN";
            Lucky.call("init",(res)=>{
                console.log(res);
            },[recipient]);
        },
        clickCreate:(ev)=>{
            if(!raw || !createName) return false;
            Lucky.call("create",(res)=>{
                console.log(res);
            },[createName,raw]);
        },
        clickEnable:(ev)=>{
            if(!actionName) return false;
            Lucky.call("enable",(res)=>{
                console.log(res);
            },[actionName]);
        },
        clickDisable:(ev)=>{
            if(!actionName) return false;
            Lucky.call("disable",(res)=>{
                console.log(res);
            },[actionName]);
        },
        clickFetch:(ev)=>{
            if(!cid) return false;
            TPL.compact(cid,(res)=>{
                if(res.error) return false;
                setRaw(JSON.stringify(res));
            });
        },
        
        fresh: async ()=>{
            await Lucky.set(wallet);

            //const list=await Lucky.get("name_list");
            //console.log(list);

            //const whitelist=await Lucky.get("white_list");
            //console.log(whitelist);

            //const counter=await Lucky.get("gene_counter",["demo"]);
            //console.log(counter.value.toString());

            // const signature="44jobuVz1UZ9Gic9P5xcJViK4VrAFYY1NXSE1KhzRaiVYWvY8TCWVw8S1WXJzrxzsnYK5pLrmgwRfrNG99WSZgg5";
            // const record=await Lucky.get("claim_record",["happy",signature]);
            // console.log(record);

            //const record=await Lucky.get("ticket_record",["happy"]);
            //console.log(record);

            // const data=await Lucky.get("gene_data",["happy"]);
            // console.log(data);
        },
    }

    useEffect(() => {
        //if(wallet.publicKey.toString()==="GTNgXEzmG2E2d9yX8fwueP4bD2WCgJ3mqvt7sQj6CYYr") setHidden(false);
        self.fresh();


    }, []);
    
    return (
        <Row className="pt-2">
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                System status
            </Col>

            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <hr/>
            </Col>
            <Col className="" sm={size.left[0]} xs={size.left[0]}>
               Init LuckySig sysetm.
            </Col>
            <Col className="text-end" sm={size.left[1]} xs={size.left[1]}>
                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                    self.clickInit(ev);
                }}>Init System</button>
            </Col>

            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <hr/>
            </Col>
            <Col className="" sm={size.left[0]} xs={size.left[0]}>
                <Row>
                    <Col className="" sm={size.row[0]} xs={size.row[0]}>Create new gene.</Col>
                    <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                        <small>Gene Name</small>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Gene name 3~5 characters." 
                            value={createName}
                            onChange={(ev)=>{
                                self.changeCreateName(ev);
                            }}
                        />
                    </Col>
                    <Col className="pt-2" sm={size.row[0]} xs={size.row[0]}>
                        <small>Gene Raw Data</small>
                        <textarea 
                            className="form-control" 
                            //disabled  
                            placeholder="Gene compact raw data" 
                            value={raw}
                            readOnly
                        ></textarea>
                    </Col>
                    <Col className="pt-2" sm={size.ipfs[0]} xs={size.ipfs[0]}>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="IPFS cid to get data"
                            value={cid}
                            onChange={(ev)=>{
                                self.changeCID(ev);
                            }}
                        />
                    </Col>
                    <Col className="pt-2 text-end" sm={size.ipfs[1]} xs={size.ipfs[1]}>
                        <button className="btn btn-md btn-primary" onClick={(ev)=>{
                            self.clickFetch(ev);
                        }}>Fetch & Convert</button>
                    </Col>
                </Row>
            </Col>
            <Col className="text-end pt-4" sm={size.left[1]} xs={size.left[1]}>
                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                    self.clickCreate(ev);
                }}>Create Gene</button>
            </Col>

            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <hr/>
            </Col>
            <Col sm={size.left[0]} xs={size.left[0]}>
                <Row>
                    <Col  sm={size.row[0]} xs={size.row[0]}>
                        <small>Gene Name</small>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Gene name to enable." 
                            value={actionName} 
                            onChange={(ev)=>{
                                self.changeActoinName(ev)
                            }}
                        />
                    </Col>
                </Row>
            </Col>
            <Col className="text-end pt-4" sm={size.left[1]} xs={size.left[1]}>
                <button className="btn btn-md btn-primary pr-2" onClick={(ev)=>{
                    self.clickDisable(ev);
                }}>Disable</button>
                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                    self.clickEnable(ev);
                }}>Enable</button>
            </Col>

        </Row>
    )
}

export default Portal;