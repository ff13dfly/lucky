import { Row, Col } from "react-bootstrap";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SHA256, MD5 } from "crypto-js";

import Solana from "../lib/solana";
import TPL from "../system/tpl";

function Demo(props) {
    const size = {
        row: [12],
        left: [2, 7,3],
        search: [9, 3],
    }

    const wallet = useWallet();
    const self={
        convert:(tpl,cid)=>{
            //console.log(tpl);
            const gene={
                basic:[tpl.size,tpl.grid,tpl.cell],
                parts:[],
                series:self.getSeries(tpl.series),
                raw:`https://${cid}.ipfs.w3s.link/`,
            }

            for(let i=0;i<tpl.parts.length;i++){
                const row=tpl.parts[i];
                gene.parts.push([
                    row.value,
                    row.img,
                    row.position,
                    row.rarity,
                ])
            }

            return gene;
        },
        getSeries:(series)=>{
            const ss=[];
            for(let i=0;i<series.length;i++){
                const row=series[i];
                //ss.push({name:row.name,desc:row.desc})
                ss.push([row.name,row.desc])
            }
            return ss;
        },
    };
    const test = {
        claimToken: async (name,sign) => {
            if (!wallet.connected) return false;
            const program = await Solana.getContract(wallet);

            //const name = "great";
            //const sign = "44jobuVz1UZ9Gic9P5xcJViK4VrAFYY1NXSE1KhzRaiVYWvY8TCWVw8S1WXJzrxzsnYK5pLrmgwRfrNG99WSZgg5";
            //const owner="G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN";
            const m5 = MD5(name + sign).toString();
            const pub_creator="7yt5Dia64Mg5bZNfk3AU44Cdb4v93kaDRMZ9RXaSK9Lw";
            const creator=Solana.getPublicKey(pub_creator);
            const pub_recipient = "G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN";
            const recipient=Solana.getPublicKey(pub_recipient);

            await program.methods
                .claim(m5, name, sign)
                .accounts({
                    payer: wallet.publicKey,
                    recipient:recipient,
                    creator:creator,
                })
                .rpc()
                .catch((err) => {
                    console.log(err);
                })
        },
        recordWinner: async () => {
            if (!wallet.connected) return false;
            const program = await Solana.getContract(wallet);

            const name = "hello";
            const sign = "3mrojpViSovpHN4JB3Vgv1VPTfSW6EeSxsTA7yCJur6PSaxADrfZnsgQEgJNrX4duf6HS4Ntgq8biy649F4zCKbd";
            const owner = "G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN";
            const m5 = MD5(name + sign).toString();
            //console.log(m5.toString());

            await program.methods
                .record(m5, name, sign, owner)
                .accounts({
                    payer: wallet.publicKey,
                })
                .rpc()
                .catch((err) => {
                    console.log(err);
                })
        },
        createGene: async () => {
            if (!wallet.connected) return false;
            const program = await Solana.getContract(wallet);
            const name = "demo";
            const gene = {
                "basic":[[600,600],[4,5],[200,200]],
                "parts":[
                    [[2,4,8,0],[0,0,1,1],[100,120],[[2]]],
                    [[12,4,5,0],[1,2,0,0],[0,120],[[3,4]]],
                    [[22,2,5,0],[2,0,1,0],[200,120],[[0,2,3]]],
                    [[24,2,1,0],[4,0,2,2],[0,0],[[0]]]
                ],
                "series":[["NAME","DESC_OF_SERIRES"]],
                "raw":"URI_OF_IPFS"
            };
            const next = 6;
            const creator="7yt5Dia64Mg5bZNfk3AU44Cdb4v93kaDRMZ9RXaSK9Lw";       //接受token的账号
            const recipient = "G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN";
            const acc_recipient=Solana.getPublicKey(recipient);

            await program.methods
                .create(name,JSON.stringify(gene),creator, next)
                .accounts({
                    payer: wallet.publicKey,
                    recipient:acc_recipient,
                })
                .rpc()
                .catch((err) => {
                    console.log(err);
                })
        },
        newGene:async(name,cid)=>{
            if (!wallet.connected) return false;
            TPL.view(cid,async (dt)=>{
                //console.log(dt);
                if(dt.error) return false;
                const gene = self.convert(dt,cid);
                
                console.log(JSON.stringify(gene));
                const program = await Solana.getContract(wallet);
                const next = 6;
                //const creator="7yt5Dia64Mg5bZNfk3AU44Cdb4v93kaDRMZ9RXaSK9Lw";       //接受token的账号
                const recipient = "G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN";
                const acc_recipient=Solana.getPublicKey(recipient);
                await program.methods
                    .create(name,JSON.stringify(gene), next)
                    .accounts({
                        payer: wallet.publicKey,
                        recipient:acc_recipient,
                    })
                    .rpc()
                    .catch((err) => {
                        console.log(err);
                    })
            });
        },
        enableGene: async (name)=>{
            if (!wallet.connected) return false;
            const program = await Solana.getContract(wallet);
            //const name = "demo";
            await program.methods
            .enable(name)
            .accounts({
                payer: wallet.publicKey,
            })
            .rpc()
            .catch((err) => {
                console.log(err);
            })
        },
        removeManager: async () => {
            if (!wallet.connected) return false;
            const program = await Solana.getContract(wallet);
            const txSign=await program.methods
                .remove("573VCwSmhKZanibsFseiy4BpGhQkUcxJv4Nnpcfx4tbP")
                .accounts({
                    payer: wallet.publicKey,
                })
                .rpc()
                .catch((err) => {
                    console.log(err);
                })
            const cnt=Solana.getConnection();
            cnt.onAccountChange(wallet.publicKey, (updatedAccountInfo) => {
                console.log("🔄 账户数据更新: ", updatedAccountInfo);
            });
        },
        addManager: async () => {
            if (!wallet.connected) return false;
            const program = await Solana.getContract(wallet);
            const txSign=await program.methods
                .add("573VCwSmhKZanibsFseiy4BpGhQkUcxJv4Nnpcfx4tbP")
                .accounts({
                    payer: wallet.publicKey,
                })
                .rpc()
                .catch((err) => {
                    console.log(err);
                })
            console.log(txSign);
            Solana.onChange(wallet.publicKey,(data)=>{
                console.log(data);
            });
        },
        initLucky: async () => {
            if (!wallet.connected) return false;

            const program = await Solana.getContract(wallet);
            console.log(program);

            const testAccount = Solana.getNewAccount();
            console.log(wallet, testAccount);
            const recipient = "G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN";
            //const recipient=null;
            await program.methods
                .init(recipient)
                .accounts({
                    payer: wallet.publicKey,
                })
                .rpc()
                .catch((err) => {
                    console.log(err);
                })

        },
        //need to modify the IDL to go 
        dataAccount: async () => {
            if (!wallet.connected) return false;

            const program = await Solana.getContract(wallet);
            const addressInfoAccount = Solana.getNewAccount();
            const addressInfo = {
                name: 'Joe C',
                houseNumber: 136,
                street: 'Mile High Dr.',
                city: 'Solana Beach',
            };

            await program.methods
                .createAddressInfo(
                    addressInfo.name,
                    addressInfo.houseNumber,
                    addressInfo.street,
                    addressInfo.city
                )
                .accounts({
                    addressInfo: addressInfoAccount.publicKey,
                    payer: wallet.publicKey,
                })
                .signers([addressInfoAccount])
                .rpc()
                .catch((err) => {
                    console.log(err);
                })
        },
        show: async () => {
            const sign_01 = "4wwoLmLCN7uq2pG5smQEeTngjjFjeUW3etDcbUm39bx5DroXUB7H2o6KDWxvucYwc9D8iVM9njCqtMVkUYT8MYxi";
            const sign_02 = "285ovKjiUTLDLzMAw7qYfG54gePLytnCxDr3qzTjDUdvouqgjwiyofzJSc1YJ8UdedJt7mfF7m1jMeDrqfoz7v4n";
            const tx = await Solana.getTransaction(sign_01);

            const slot_0 = tx.slot, slot_66 = tx.slot + 66;
            const hash_0 = await Solana.getSlotHash(slot_0);
            const hash_66 = await Solana.getSlotHash(slot_66);
            console.log(slot_0, slot_66);
            console.log(tx, hash_0, hash_66);
            console.log(SHA256(tx + hash_0 + hash_66).toString())
        },
        check:{
            RegistryName:async()=>{
                const program = await Solana.getContract(wallet);
                const target="registryName";
                const seeds=["luck_mapping"];
                const PDA=Solana.getPDA(seeds,program.programId);
                const data=await program.account[target].fetch(PDA);
                console.log(data);
            },
            WhiteList:async()=>{
                const program = await Solana.getContract(wallet);
                //console.log(program.connection);
                const target="whiteList";
                const seeds=["whitelist_vec"];
                const PDA=Solana.getPDA(seeds,program.programId);
                const data=await program.account[target].fetch(PDA);
                console.log(data);
            },
            GeneData:async(name)=>{
                const program = await Solana.getContract(wallet);
                const target="geneData";
                const seeds=["gene_storage_account",name];
                const PDA=Solana.getPDA(seeds,program.programId);
                const onchain=await program.account[target].fetch(PDA);
                if(onchain.data) onchain.data=JSON.parse(onchain.data);
                console.log(onchain);
            },
            GeneCounter:async(name)=>{
                const program = await Solana.getContract(wallet);
                const target="geneCounter";
                const seeds=["gene_counter",name];
                const PDA=Solana.getPDA(seeds,program.programId);
                const data=await program.account[target].fetch(PDA);
                console.log(`Gene "${name}" amount:`,data);
            },
            LuckCounter:async()=>{
                const program = await Solana.getContract(wallet);
                const target="luckCounter";
                const seeds=["luck_counter"];
                const PDA=Solana.getPDA(seeds,program.programId);
                const data=await program.account[target].fetch(PDA);
                console.log(`Total amount:`,data);
            },
            ClaimRecord:async(md5,signature)=>{
                const program = await Solana.getContract(wallet);
                const target="claimRecord";
            },
            LuckyRecord:async(name,signature)=>{
                const program = await Solana.getContract(wallet);
                const m5 = MD5(name + signature).toString();

                const target="luckyRecord";
                const seeds=[m5,"approve"];
                
                const PDA=Solana.getPDA(seeds,program.programId);
                const data=await program.account[target].fetch(PDA);
                console.log(data);
            },
            TicketRecord:async(name,pubkey)=>{
                const program = await Solana.getContract(wallet);
                const target="ticketRecord";
                //const seeds=[name,pubkey.toString()];
                const seeds=[name];
                const PDA=Solana.getPDA(seeds,program.programId);
                console.log(PDA);
                //const data=await program.account[target].fetch(PDA);
                //console.log(data);
            },
        }
    }

    useEffect(() => {
        test.check.WhiteList();
        //test.check.GeneData("great");
        //test.check.LuckCounter();
        //test.check.GeneCounter("happy");
        //test.check.LuckyRecord("great","246TyqXk2CGw7kimRyq7pZiLYX3tQJUJXDfd8ydzQaxt7aFMV3RgLsf6oXo1KH5zNt5Wn737RWbt1R8By1bLtX2h");

        //const pkey=Solana.getPublicKey("G5YzePkbR7istighPC2xSjmGQh6SyVB1YcwYc5jVmvGN");
        //test.check.TicketRecord("demo",pkey);

    }, [wallet.publicKey]);

    return (
        <Row >
            <Col className="text-center" sm={size.row[0]} xs={size.row[0]}>
                <button className="btn btn-md btn-primary" onClick={(ev)=>{
                    //test.newGene("happy","bafkreigjeowpgshbsswslymct56kbgjfxvegimrmxzcnmscu2au3e2o6am");
                    test.enableGene("happy");
                    //test.claimToken("great","246TyqXk2CGw7kimRyq7pZiLYX3tQJUJXDfd8ydzQaxt7aFMV3RgLsf6oXo1KH5zNt5Wn737RWbt1R8By1bLtX2h");
                }}>Try to call</button>
            </Col>
        </Row>
    )
}

export default Demo;