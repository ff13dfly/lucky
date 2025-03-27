import { Row, Col } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { SHA256,MD5 } from "crypto-js";

import { useWallet } from "@solana/wallet-adapter-react";

import tools from "../system/tools";
import Data from "../system/data";

import Priveiw from "./preview";
import Hash from "./hash/hash";
import TPL from "../system/tpl";
import Cache from "../lib/cache";
import Copy from "../lib/clipboard";
import Approver from "../lib/approver";
import Solana from "../lib/solana";

import Ticket from "./ticket";

import { FaCopy } from "react-icons/fa";

/* Single signature detail page
*   @param  {string}    signature       //force to fresh function
*   @param  {number}    slot            //transaction slot
*   @param  {boolean}   win             //wether win
*   @param  {string}    gene            //gene cid
*   @param  {string}    owner           //signature owner
*   @param  {function}  dialog          //system dialog function
*/
         
function Details(props) {
    const size = {
        row: [12],
        left: [4, 8],
        right: [7, 5],
    }

    const progress=[
        {title:"Checking LUCK status...",style:"info"},                 // 0
        {title:"Already claimed.",style:"warning"},                     // 1
        {title:"Failed to cliam the token. :-(",style:"warning"},       // 2
        {title:"Failed to approve the signature",style:"danger"},       // 3
        {title:"Claim LUCK token",style:"primary"},                     // 4
        {title:"Approving LUCK token...",style:"info"},                 // 5
        {title:"Got creator of gene...",style:"info"},                  // 6
        {title:"Prepare to claim...",style:"info"},                     // 7
        {title:"Ready to claim, go!",style:"info"},                     // 8
        {title:"Finalizing on chain...",style:"info"},
        {title:"Claim successful!",style:"primary"},
    ]

    let [hash, setHash] = useState("0x0000000000000000000000000000000000000000000000000000000000000000");
    let [hashStart, setHashStart] = useState("");
    let [hashEnd, setHashEnd] = useState("");
    let [recover, setRecover] = useState({});       //copy status recover
    let [offset, setOffset] = useState(66);         //gene value offset

    let [name, setName] = useState("");             //gene name
    let [pointer,setPointer]=useState(0);           //progress pointer
    let [disable, setDisable] = useState(true);     //wether disable button
    let [info, setInfo] = useState(progress[0].title);

    let [hidden,setHidden] = useState(true);

    let active = useRef(1);

    const icons = {
        solscan: `${window.location.origin}/image/solscan.png`,
    }

    const wallet = useWallet();
    const self = {
        clickCopy: (val) => {
            Copy(val);
        },
        clickApprove:(ev)=>{
            self.showStep(5);
            setDisable(true);
            setTimeout(()=>{
                self.claimToken();
                // Approver.check(props.signature,props.gene,(res)=>{
                //     self.claimToken();
                // });
            },1000);
        },
        claimToken:async ()=>{
            if(!name) return false;
            const gdata=await self.getGeneData(name);
            if(gdata.error) return self.failedClaim(2);

            self.showStep(6);
            setTimeout(async () => {
                self.showStep(7);
                const whitelist=await self.getWhiteList(name);
                if(whitelist.error) return self.failedClaim(2);
    
                self.showStep(8);
                self.doClaim(gdata.creator,whitelist.recipient);

            }, 500);
        },
        doClaim:async (creator,recipient)=>{
            if (!wallet.connected) return false;
            const program = await Solana.getContract(wallet);
            const m5 = MD5(name + props.signature).toString();
            const acc_creator=Solana.getPublicKey(creator);
            const acc_recipient=Solana.getPublicKey(recipient);
            program.methods
                .claim(m5, name, props.signature)
                .accounts({
                    payer: wallet.publicKey,
                    recipient:acc_recipient,
                    creator:acc_creator,
                })
                .rpc()
                .catch((err) => {
                    self.failedClaim(2);
                });

            const cnt=Solana.getConnection();
            cnt.onAccountChange(wallet.publicKey, (updatedAccountInfo) => {
                
            });
        },
        showStep:(index)=>{
            setPointer(index);
            setInfo(progress[index].title);
        },
        getInput:()=>{
            if(window.location.pathname && window.location.pathname.length!==1){
                const input=window.location.pathname.slice(1);
                if(Solana.validAccount(input)) return input;
            }
            return false
        },
        failedClaim:(index)=>{
            setPointer(index);
            return setInfo(progress[index].title);
        },
        getWhiteList:async()=>{
            const program = await Solana.getContract(wallet);
            const target="whiteList";
            const seeds=["whitelist_vec"];
            const PDA=Solana.getPDA(seeds,program.programId);
            return await program.account[target].fetch(PDA);
        },
        getGeneData:async(name)=>{
            const program = await Solana.getContract(wallet);
            const target="geneData";
            const seeds=["gene_storage_account",name];
            const PDA=Solana.getPDA(seeds,program.programId);
            const onchain=await program.account[target].fetch(PDA);
            if(onchain.data) onchain.data=JSON.parse(onchain.data);
            return onchain;
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
                });
            });
        },
        getHash: (block, signature, ck) => {
            const arr = [block, block + offset];
            Cache(arr, (map) => {
                if (map === false) return ck && ck(false);
                const hash = `0x${SHA256(signature + map[block] + map[block + offset]).toString()}`;
                return ck && ck(hash, map);
            });
        },
        
        callRecover: (key, at) => {
            if (!recover[key]) {
                recover[key] = "text-warning";
                setRecover(tools.copy(recover));
                setTimeout(() => {
                    delete recover[key];
                    setRecover(tools.copy(recover));
                }, !at ? 1000 : at);
            }
        },
        //https://solscan.io/account/GZYzLnHRui8iE7RckCcZQgpTvGu8A37gS6pTDJb23EDx?cluster=devnet
        getLink: (type, value, network) => {
            const net = !network ? "devnet" : network;
            const base = "https://solscan.io/";

            let link = "";
            switch (type) {
                case "tx":
                    link = `${base}/tx/${value}?cluster=${net}`;
                    break;

                case "block":
                    link = `${base}/block/${value}?cluster=${net}`;
                    break;

                default:
                    break;
            }
            return link;
        },
        getButtonStyle:()=>{
            return `btn btn-lg btn-${progress[pointer].style}`;
        },
        getLuckyRecord:async(name,signature)=>{
            const program = await Solana.getContract(wallet);
            const m5 = MD5(name + signature).toString();

            const target="luckyRecord";
            const seeds=[m5,"approve"];

            const PDA=Solana.getPDA(seeds,program.programId);
            try {
                const data =await program.account[target].fetch(PDA);
                return data;
            } catch (error) {
                return {error:"No record on chain."}
            }
        },
        getClaimRecord:async(name,signature)=>{
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
        setClaimedStatus:()=>{
            //1.check name from approver server
            Approver.name(props.gene,async(dt)=>{
                if(dt.error) return self.failedClaim(2)
                const name=dt.name;
                setName(name);
                setHidden(false);
                //2. check wether approved.
                const record=await self.getLuckyRecord(name,props.signature);
                if(record.error){
                    return Approver.check(props.signature,props.gene,async (res)=>{
                        if(res.error) return setInfo(res.error);
                        if(!res.win) return self.failedClaim(3);

                        const tag=await self.getClaimRecord(name,props.signature);
                        if(tag.error){
                            setDisable(false);
                            return self.failedClaim(4)
                        }else{
                            self.showStep(2);
                        }
                    })
                }else{
                    //3. check wether claimed.
                    const tag=await self.getClaimRecord(name,props.signature);
                    console.log(tag);
                    if(tag.error){
                        setDisable(false);
                        return self.failedClaim(4)
                    }else{
                        self.showStep(2);
                    }
                }

                
            });
        },
        fresh:()=>{
            //1. fresh render
            self.getGene(props.gene, (tpl) => {
                if (!tpl.error) Data.set("template", tpl);
                self.getHash(props.slot, props.signature, (dt, map) => {
                    setHashStart(map[props.slot]);
                    setHashEnd(map[props.slot + offset]);
                    setHash(dt);
                });
            });

            if(props.win && props.owner===wallet.publicKey.toString())self.setClaimedStatus();
        },

    }

    useEffect(() => {
        self.fresh();
    }, [props.signature, props.gene, wallet.publicKey]);

    return (
        <Row >
            <Col className="" sm={size.row[0]} xs={size.row[0]}>
                <Row>
                    <Col className="" sm={size.left[0]} xs={size.left[0]}>
                        ( <strong className="text-info">A</strong> ) Transaction Signature
                    </Col>
                    <Col className="" sm={size.left[1]} xs={size.left[1]}>
                        <button className="btn btn-sm btn-default">
                            <a href={self.getLink("tx", props.signature)} target="blank">
                                <img className="icon" src={icons.solscan} alt="solscan link" />
                            </a>
                        </button>
                        {tools.shorten(props.signature, 20)}
                        <button className="btn btn-sm btn-default" onClick={(ev) => {
                            self.clickCopy(props.signature);
                            self.callRecover("sign");
                        }}>
                            <FaCopy className={!recover["sign"] ? "" : recover["sign"]} size={18} />
                        </button>
                    </Col>
                    <Col className="" sm={size.left[0]} xs={size.left[0]}>
                        ( <strong className="text-info">B</strong> ) Slot [ {props.slot.toLocaleString()} ]
                    </Col>
                    <Col className="" sm={size.left[1]} xs={size.left[1]}>
                        <button className="btn btn-sm btn-default">
                            <a href={self.getLink("block", props.slot)} target="blank">
                                <img className="icon" src={icons.solscan} alt="solscan link" />
                            </a>
                        </button>
                        {tools.shorten(hashStart, 15)}
                        <button className="btn btn-sm btn-default" onClick={(ev) => {
                            self.clickCopy(hashStart);
                            self.callRecover("start");
                        }}>
                            <FaCopy className={!recover["start"] ? "" : recover["start"]} size={18} />
                        </button>
                    </Col>
                    <Col className="" sm={size.left[0]} xs={size.left[0]}>
                        ( <strong className="text-info">C</strong> ) Slot [ {(props.slot + offset).toLocaleString()} ]
                    </Col>
                    <Col className="" sm={size.left[1]} xs={size.left[1]}>
                        <button className="btn btn-sm btn-default">
                            <a href={self.getLink("block", props.slot + offset)} target="blank">
                                <img className="icon" src={icons.solscan} alt="solscan link" />
                            </a>
                        </button>
                        {tools.shorten(hashEnd, 15)}
                        <button className="btn btn-sm btn-default" onClick={(ev) => {
                            self.clickCopy(hashEnd);
                            self.callRecover("end");
                        }}>
                            <FaCopy className={!recover["end"] ? "" : recover["end"]} size={18} />
                        </button>
                    </Col>
                </Row>
            </Col>

            <Col sm={size.row[0]} xs={size.row[0]}>
                <hr />
            </Col>

            <Col className="text-center" sm={size.right[0]} xs={size.right[0]}>
                <Row style={{ paddingLeft: "15px" }}>
                    <Col className="board-preview" style={{ paddingTop: "15px", paddingBottom: "5px" }} sm={size.row[0]} xs={size.row[0]}>
                        <Priveiw
                            id={`detail_preview`}
                            hash={hash}
                            hidden={false}
                            template={props.gene}
                            force={true}
                            //hightlight={active.current}
                            animate={true}
                        />
                    </Col>
                </Row>
            </Col>
            <Col style={{ paddingLeft: "40px" }} sm={size.right[1]} xs={size.right[1]}>
                <Row className="pt-3">
                    <Col sm={size.row[0]} xs={size.row[0]}>
                        <p>Formulate: <strong className="text-info">sha256( A + B + C )</strong></p>
                    </Col>
                    <Col sm={size.row[0]} xs={size.row[0]}>
                        <hr />
                    </Col>
                    <Col sm={size.row[0]} xs={size.row[0]}>
                        <Hash
                            hash={hash}
                            active={active.current}
                        />
                    </Col>
                    <Col sm={size.row[0]} xs={size.row[0]}>
                        <hr />
                    </Col>
                    <Col sm={size.row[0]} xs={size.row[0]}>
                        <Ticket gene={props.gene}/>
                    </Col>
                </Row>
            </Col>

            <Col hidden={hidden} className="pt-1" sm={size.row[0]} xs={size.row[0]}>
                <hr/>
            </Col>

            <Col hidden={hidden} className="text-center pt-2" sm={size.row[0]} xs={size.row[0]}>
                <button className={self.getButtonStyle()} disabled={disable} onClick={(ev)=>{
                    self.clickApprove(ev);
                }}>{info}</button>
            </Col>
            
        </Row>
    )
}

export default Details;