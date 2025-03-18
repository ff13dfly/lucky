import { Keypair,PublicKey,SystemProgram,LAMPORTS_PER_SOL,Transaction } from "@solana/web3.js";
import { getAccount,getAssociatedTokenAddressSync } from '@solana/spl-token';
import md5 from "md5";

let provider=null;
let PID=null;
const seed_root = "great april trend rely recipe agent sting owner forget sibling luggage root";
const seed_recipient="yesterday april buy rely recipe agent sting friend forget sibling luggage root";
const seed_manager = "great bad trend rely apple agent sting owner forget sibling luggage root";
const seed_creator= "today april trend rely wait agent sting owner forget sibling luggage root";

const self={
    setENV:(pvd,programId)=>{
        provider=pvd;
        PID=programId;
    },
    init:async (cfg)=>{
      self.output.hr("Preparing accounts");
      const mPDA=self.tokenPDA();

      const pair_root=self.getKeypairFromSeed(seed_root);
      const pair_manager=self.getKeypairFromSeed(seed_manager);
      const pair_creator=self.getKeypairFromSeed(seed_creator);
      const pair_recipient=self.getKeypairFromSeed(seed_recipient);
      const pair_user_0=self.getKeypair();
      const pair_user_1=self.getKeypair();

      //1.准备账号
      const users={
        root:{
          seed:seed_root,
          pair:pair_root,
          token:self.getTokenAccount(pair_root.publicKey,mPDA),
        },
        manager:{
          seed:seed_manager,
          pair:pair_manager,
          token:self.getTokenAccount(pair_manager.publicKey,mPDA),
        },
        recipient:{
          seed:seed_recipient,
          pair:pair_recipient,
          token:self.getTokenAccount(pair_recipient.publicKey,mPDA),
        },
        creator:{
          seed:seed_creator,
          pair:pair_creator,
          token:self.getTokenAccount(pair_creator.publicKey,mPDA),
        },
        signer:[
          pair_user_0,
          pair_user_1,
        ],
      }

      //2.模拟水龙头加SOL
      const amount=8
      await self.fundAccount(users.root.pair.publicKey,amount,provider.wallet);
      await self.fundAccount(users.manager.pair.publicKey,amount,provider.wallet);
      await self.fundAccount(users.recipient.pair.publicKey,amount,provider.wallet);
      await self.fundAccount(users.creator.pair.publicKey,amount,provider.wallet);
      await self.fundAccount(users.signer[0].publicKey,amount,provider.wallet);
      await self.fundAccount(users.signer[1].publicKey,amount,provider.wallet);

      if(cfg && cfg.balance) await self.showBalance(users);
      //if(cfg && cfg.token) await self.showToken(users);

      self.output.hr("Account done.");
      return users;
    },
    showBalance:async (users)=>{
      const bs_root= await self.getBalance(users.root.pair.publicKey);
      const bs_manager=await self.getBalance(users.manager.pair.publicKey);
      const bs_creator=await self.getBalance(users.creator.pair.publicKey);
      const bs_recipient=await self.getBalance(users.recipient.pair.publicKey);
      const bs_user_0=await self.getBalance(users.signer[0].publicKey);
      const bs_user_1=await self.getBalance(users.signer[1].publicKey);
      
      console.log(`Root (${users.root.pair.publicKey.toString()}) balance: ${bs_root} SOL.`);
      console.log(`Manager (${users.manager.pair.publicKey.toString()}) balance: ${bs_manager} SOL.`);
      console.log(`Recipient (${users.recipient.pair.publicKey.toString()}) balance: ${bs_recipient} SOL.`);
      console.log(`Creator (${users.creator.pair.publicKey.toString()}) balance: ${bs_creator} SOL.`);
      console.log(`User_0 (${users.signer[0].publicKey.toString()}) balance: ${bs_user_0} SOL.`);
      console.log(`User_1 (${users.signer[1].publicKey.toString()}) balance: ${bs_user_1} SOL.`);
    },
    showToken:async (users)=>{
      const mPDA=self.tokenPDA()
      const acc_token_0=self.getTokenAccount(users.signer[0].publicKey,mPDA);
      const acc_token_1=self.getTokenAccount(users.signer[1].publicKey,mPDA);
      
      const bs_creator=await self.getTokenBalance(users.creator.token);
      const bs_acc_0=await self.getTokenBalance(acc_token_0);

      console.log(`System token "luck" address: ${mPDA.toString()}`);
      console.log(`Creator (${users.creator.token.toString()}) token balance: ${bs_creator} unit.`);
      console.log(`User 0 (${acc_token_0.toString()}) token  balance: ${bs_acc_0} unit.`);
    },
    getTokenAccount:(pubkey,mintPDA)=>{;
      return getAssociatedTokenAddressSync(mintPDA, pubkey);
    },
    tokenPDA:()=>{
      const [mintPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("luck_token_creator")
        ],
        PID);
      return mintPDA;
    },
    
    getTokenBalance:async(tokenAddress)=>{
      //console.log(`here`,getAccount,tokenAddress);
      const tk_new = await getAccount(provider.connection, tokenAddress);
      //console.log(tk_new);
      return Number(tk_new.amount);
    },
    getBalance:async (pub:PublicKey)=>{
      const balance = await provider.connection.getBalance(pub);
      return balance;
    },
    getKeypairFromSeed:(str)=>{
        const seed = new TextEncoder().encode(str).slice(0, 32);
        return Keypair.fromSeed(seed);
      },
    getPDA:(seeds:Buffer[],programId)=>{
      //const arr=[Buffer.from('lememe_mapping')];
      const [PDA_account] = PublicKey.findProgramAddressSync(seeds,programId);
      return PDA_account;
    },
    
    getAccount:async (account)=>{
      const acc= await provider.connection.getAccountInfo(account);
      return acc;
    },
    getKeypair:()=>{
      return new Keypair();
    },
    fundAccount:async (to_pubkey, amount:number, from:any)=>{
      if(from===undefined) from=provider.wallet;
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to_pubkey,
          lamports: amount*LAMPORTS_PER_SOL,
        })
      );
      const txSignature = await provider.sendAndConfirm(transaction);
      return txSignature;
    },
    output:{
      hr:(title)=>{
        console.log(`--------------------------- ${title}---------------------------`);
      },
      start:(title)=>{
        console.log(`\n---------------------------${title}---------------------------`);
      },
      end:(title)=>{
        console.log(`****** END:${title} ******`);
      },
    },
    info:{
        whitelist:async ()=>{
          const pda_whitelist=self.getPDA([Buffer.from("whitelist_vec")],PID);
          const data_w=await self.getAccount(pda_whitelist);
          if(data_w!==null) console.log(data_w.data.toString());
        },
        namelist:async ()=>{
          const pda_map=self.getPDA([Buffer.from("luck_mapping")],PID);
          const data_m =await self.getAccount(pda_map);
          if(data_m!==null) console.log(data_m.data.toString());
        },
        gene:async(name)=>{
          const seeds=[
            Buffer.from("gene_storage_account"),
            Buffer.from(name)
          ]
          const pda_map=self.getPDA(seeds,PID);
          const data_m =await self.getAccount(pda_map);
          if(data_m!==null) console.log(data_m.data.toString());
        },
        record:async(name,signature)=>{
          const seeds=[
            Buffer.from(md5(name+signature)),
            Buffer.from("approve")
          ]
          const pda_map=self.getPDA(seeds,PID);
          const data_m =await self.getAccount(pda_map);
          if(data_m!==null) console.log(data_m.data.toString());
        },
        claim:async(name,signature)=>{
          const seeds=[
            Buffer.from(md5(name+signature)),
            Buffer.from("claim")
          ]
          const pda_map=self.getPDA(seeds,PID);
          const data_m =await self.getAccount(pda_map);
          if(data_m!==null) console.log(data_m.data.toString());
        },
        recipient:async()=>{
          const pda_recipient=self.getPDA([Buffer.from("fee_recipient")],PID);
          const data_w=await self.getAccount(pda_recipient);
          if(data_w!==null) console.log(data_w.data.toString());
        },
        counter:async()=>{
          const pda_counter=self.getPDA([Buffer.from("luck_counter")],PID);
          const data_w=await self.getAccount(pda_counter);
          if(data_w!==null) console.log(data_w.data.toString());
        },
        singleCounter:async(name)=>{
          const pda_counter=self.getPDA([
            Buffer.from("gene_counter"),
            Buffer.from(name)
          ],PID);
          const data_w=await self.getAccount(pda_counter);
          if(data_w!==null) console.log(data_w.data.toString());
        },
    },
  }
  
export default self;