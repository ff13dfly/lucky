import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Solana from "../lib/solana";
import Approver from "../lib/approver";

function Ticket(props) {
    const size = {
        row: [12],
    };

    let [hidden, setHidden]= useState(true);
    let [name, setName] = useState("");

    const wallet = useWallet();
    const self={
        clickTicket:async (ev)=>{
            if (!wallet.connected) return false;
            const whitelist=await self.getWhiteList(name);
            const gene=await self.getGeneData(name);
            if(whitelist.eror || gene.error) return false;

            const program = await Solana.getContract(wallet);
            const acc_creator=Solana.getPublicKey(gene.creator);
            const acc_recipient=Solana.getPublicKey(whitelist.recipient);
            program.methods
                .ticket(name)
                .accounts({
                    payer: wallet.publicKey,
                    recipient:acc_recipient,
                    creator:acc_creator,
                })
                .rpc()
                .catch((err) => {
                    console.log(err);
                });
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
        getWhiteList:async()=>{
            const program = await Solana.getContract(wallet);
            const target="whiteList";
            const seeds=["whitelist_vec"];
            const PDA=Solana.getPDA(seeds,program.programId);
            return await program.account[target].fetch(PDA);
        },
        status:async(name)=>{
            try {
                const program = await Solana.getContract(wallet);
                const target="ticketRecord";
                const seeds=[
                    Buffer.from(name),
                    wallet.publicKey.toBuffer(),
                ]
                const PDA =Solana.getPDAByBuffer(seeds,program.programId);
                return await program.account[target].fetch(PDA);  
            } catch (error) {
                return {error:"No ticket record."}
            }
        },
        fresh:()=>{
            Approver.name(props.gene,async (res)=>{
                if(res.error) return false;
                setName(res.name);
                const dt= await self.status(res.name);
                if(dt.error){
                    setHidden(false);
                }   
            });
        },
    };

    useEffect(() => {
        self.fresh();
    }, []);

    return (
        <Row hidden={hidden} className="pt-2">
            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                <button className="btn btn-lg btn-primary" onClick={(ev)=>{
                    self.clickTicket(ev);
                }}>Buy ticket of "{name}"</button>
            </Col>
        </Row>
    );
}

export default Ticket;