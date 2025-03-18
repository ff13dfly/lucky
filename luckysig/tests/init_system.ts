import * as anchor from "@coral-xyz/anchor";
import md5 from "md5";
import { BN } from "bn.js";

import self from "./lib";
import { Luckysig } from "../target/types/luckysig";

const program = anchor.workspace.Luckysig as anchor.Program<Luckysig>;
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
self.setENV(provider,program.programId);

const env=async(ignore)=>{
  const users=await self.init({balance:!ignore});
  const name="happy";
  const trans_sign_1="4iKMKRK1S1GuJidtruwruzDkFQwvNG5kWWZ7T2NNFX7eU8GR76FZCMrbpc9bSxpy7gqFkvKjez7aA1qkhmBbfxgi";
  const m5_1=md5(name+trans_sign_1);
  const trans_sign_2="UtsKdriZ6Laqcyd5EW7hDG9r7mQhPhuCqYcsgzcWQPCXwKBVBNvyg6G3qPvcB4j9varSACNpuLjucBvnrq5Aw18";
  const m5_2=md5(name+trans_sign_2);
  const workflow={
    // init system, create LUCK token
    init:async ()=>{
      self.output.start(`System initialization`);
      const pkey=users.recipient.pair.publicKey.toString()
      const sign_init= await program.methods
        .init(pkey)
        .accounts({
          payer:users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      await self.info.counter();
      self.output.end(`Signature of init: ${sign_init}`);
    },
    // add manager to whitelist
    add:async ()=>{
      self.output.start(`Add manager to whitelist`);
      await self.info.whitelist();
      const sign_add= await program.methods
        .add(users.manager.pair.publicKey.toString())
        .accounts({
          payer:  users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      await self.info.whitelist();
      self.output.end(`Signature of add: ${sign_add}`);
    },
    // remove manager from whitelist
    remove:async()=>{
      self.output.start(`Remove manager from whitelist`);
      await self.info.whitelist();

      const sign_remove= await program.methods
        .remove(users.manager.pair.publicKey.toString())
        .accounts({
          payer:  users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      await self.info.whitelist();
      self.output.end(`Signature of remove: ${sign_remove}`);
    },
    // create new gene
    create:async ()=>{
      self.output.start(`Create new gene and pay the fee.`);
      const gene=JSON.stringify({
        "basic":[[600,600],[4,5],[200,200]],
        "parts":[
          [[2,4,8,0],[0,0,1,1],[100,120],[[2]]],
          [[12,4,5,0],[1,2,0,0],[0,120],[[3]]],
          [[22,2,5,0],[2,0,1,0],[200,120],[[0,2]]],
          [[24,2,3,0],[4,0,2,2],[0,0],[[0,2,3]]],
        ],
        "series":[["win","winner"]],
        "raw":"https://bafkreiag6qxrbeybuv6hm5x5oy5cd72bmiqubq5pubbvgphmienrwwge6m.ipfs.w3s.link/",
      });
      const next=66;
      const sign_create= await program.methods
        .create(name,gene,next)
        .accounts({
          payer:users.creator.pair.publicKey,
          //recipient:users.recipient.pair.publicKey,
          recipient:users.signer[1].publicKey,          //after migrate, need to sent the right recipient
        })
        .signers([users.creator.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      await self.info.gene(name);
      await self.showBalance(users);
      await self.info.namelist();
      self.output.end(`Signature of create: ${sign_create}`);
    },
    // enable the new gene minting
    enable:async ()=>{
      self.output.start(`Enalbe new gene.`);
      const sign_enable= await program.methods
        .enable(name)
        .accounts({
          payer:users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      await self.info.gene(name);
      self.output.end(`Signature of enable: ${sign_enable}`);
    },

    disable:async ()=>{
      self.output.start(`Disabel new gene.`);
      const sign_disable= await program.methods
        .disable(name)
        .accounts({
          payer:users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      await self.info.gene(name);
      self.output.end(`Signature of disable: ${sign_disable}`);
    },
    // Change fee recipient
    migrate:async ()=>{
      self.output.start(`Change recipient of gene create fee.`);
      const sign_mig= await program.methods
        .migrate(users.signer[1].publicKey.toString())
        .accounts({
          payer:users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
        console.log(`New recipient:${users.signer[1].publicKey.toString()}`);
        await self.info.whitelist();
        self.output.end(`Signature of migrate fee recipient: ${sign_mig}`);
    },
    limit:async ()=>{
      self.output.start(`Set gene supply to max amout.`);
      const sign_limit= await program.methods
        .limit(name)
        .accounts({
          payer:users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });

        await self.info.singleCounter(name);
        self.output.end(`Signature of set "${name}" to max supply: ${sign_limit}`);
    },

    // approve transaction signature to win LUCK
    approve_1:async ()=>{
      self.output.start(`Approve and record winner.`);
      const owner=users.signer[0].publicKey.toString();   //important, only this account can claim the token
      const sign_approve= await program.methods
        .approve(m5_1,name,trans_sign_1,owner)
        .accounts({
          payer:users.manager.pair.publicKey,
        })
        .signers([users.manager.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });

      await self.info.record(name,trans_sign_1);
      self.output.end(`Signature of approve: ${sign_approve}`);
    },
    approve_2:async()=>{
      self.output.start(`Approve more winner.`);
      
      const owner=users.signer[0].publicKey.toString();   //important, only this account can claim the token
      const sign_approve= await program.methods
        .approve(m5_2,name,trans_sign_2,owner)
        .accounts({
          payer:users.manager.pair.publicKey,
        })
        .signers([users.manager.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });

      await self.info.record(name,trans_sign_2);
      self.output.end(`Signature of approve 2: ${sign_approve}`);
    },
    // buy ticket of gene
    ticket:async ()=>{
      self.output.start(`Buy ticket of gene ${name}`);
      const sign_ticket= await program.methods
        .ticket(name)
        .accounts({
          payer:users.signer[0].publicKey,
          creator:users.creator.pair.publicKey,
          recipient:users.recipient.pair.publicKey,
        })
        .signers([users.signer[0]])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      self.output.end(`Signature of ticket: ${sign_ticket}`);
    },

    // claim LUCK token
    claim_1:async ()=>{
      self.output.start(`Claim token.`);
      //await self.info.singleCounter(name);
  
      const sign_claim= await program.methods
        .claim(m5_1,name,trans_sign_1)
        .accounts({
          payer:users.signer[0].publicKey,
          creator:users.creator.pair.publicKey,
          //recipient:users.recipient.pair.publicKey,
        })
        .signers([users.signer[0]])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      //await self.info.singleCounter(name);
      self.output.end(`Signature of claim 1: ${sign_claim}`);
    },
    claim_2:async ()=>{
      self.output.start(`Claim token.`);
      //await self.info.singleCounter(name);
  
      const sign_claim= await program.methods
        .claim(m5_2,name,trans_sign_2)
        .accounts({
          payer:users.signer[0].publicKey,
          creator:users.creator.pair.publicKey,
          //recipient:users.recipient.pair.publicKey,
        })
        .signers([users.signer[0]])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      //await self.info.singleCounter(name);
      self.output.end(`Signature of claim 2: ${sign_claim}`);
    },

    max:async ()=>{
      self.output.start(`Set LUCK to max total supply.`);
      const sign_max= await program.methods
        .max()
        .accounts({
          payer:users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      await self.info.counter();
      self.output.end(`Signature of set max of total supply: ${sign_max}`);
    },
    set:async ()=>{
      self.output.start(`Set special amount of supply.`);
      const gene_amount=new BN(20000);
      const luck_amount=new BN(100000000);
      const sign_limit= await program.methods
        .set(name,gene_amount,luck_amount)
        .accounts({
          payer:users.root.pair.publicKey,
        })
        .signers([users.root.pair])
        .rpc()
        .catch((err)=>{
          self.output.hr("Got Error");
          console.log(err);
        });
      await self.info.singleCounter(name);
      await self.info.counter();
      self.output.end(`Signature of set gene ${name} amoun and set max supply: ${sign_limit}`);
    },
    overview:async()=>{
      self.output.start(`Final information check.`);
      await self.showBalance(users);
      await self.info.whitelist();
    },
  }
  return {workflow:workflow,users:users};
}
    

describe("LuckySig System Testing",() => {
  it("Normal workflow of mint out LuckySig.", async () => {
    const {workflow} = await env(false);
    await workflow.init();
    await workflow.add();
    await workflow.migrate();
    await workflow.create();
    await workflow.enable();
    await workflow.approve_1();
    await workflow.ticket();
    await workflow.claim_1();
  });

  it("Set gene to max supply.", async () => {
    const {workflow} = await env(true);
    //await workflow.limit();
    await workflow.approve_2();
  });

  it("Backup of all action.", async () => {
    const {workflow} = await env(false);
    //await workflow.init();
    //await workflow.add();
    //await workflow.remove();
    //await workflow.migrate();
    //await workflow.create();
    //await workflow.limit();
    //await workflow.max();
    //await workflow.enable();
    //await workflow.disable();
    //await workflow.approve_1();
    //await workflow.approve_2();
    //await workflow.ticket();
    //await workflow.claim_1(); 
    //await workflow.claim_2();
    //await workflow.migrate();
    //await workflow.max();
    //await workflow.limit();
    //await workflow.set();
  });

});
