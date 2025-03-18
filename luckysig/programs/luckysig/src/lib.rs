#![allow(unexpected_cfgs)]  //solve the #[program] warning issue

use anchor_lang::prelude::*;

declare_id!("7tUr1JZECqmPAHqew3sjrzmygXsxCfzWoqfXaLsn6AZF");
//declare_id!("GZYzLnHRui8iE7RckCcZQgpTvGu8A37gS6pTDJb23EDx");
//declare_id!("6dmHubtdyReE6uLpSqbviJCt3hSaPxoYxexjkhA9Y9Az");
//declare_id!("FSkZpauodTvNQzy5v5MisEJ17FT1QNT3mwGz4MGCDrdR");

use {
    init::*,
    create::*,
    claim::*,
    approve::*,
    identity::*,
    gene::*,
};
pub mod init;
pub mod create;
pub mod claim;
pub mod approve;
pub mod identity;
pub mod constants;
pub mod gene;

#[program]
pub mod luckysig {
    use super::*;

    ///init whole system
    pub fn init(
        ctx: Context<InitLucky>,
        recipient:String,               //fee recipient
    ) -> Result<()> {
        init::entry(ctx,recipient)
    }

    ///create new LuckySig
    pub fn create(
        ctx: Context<CreateLucky>, 
        name:String, 
        gene:String,
        next:u32,
    ) -> Result<()> {
        create::entry(ctx,name,gene,next)
    }
    
    ///start gene to win LUCK token
    pub fn enable(
        ctx: Context<MangeGene>, 
        name:String, 
    ) -> Result<()> {
        enable::entry(ctx,name)
    }
    
    ///manager record the winner
    pub fn approve(
        ctx: Context<RecordLucky>,
        md5:String,                 //value MD5(name + signature)
        name:String,                //win gene name
        signature:String,           //win signature of transaction
        owner:String                //signature owner
    ) -> Result<()> {
        approve::entry(ctx,md5,name,signature,owner)
    }

    ///buy ticket of gene
    pub fn ticket(
        ctx: Context<BuyTicket>,
        name:String,                //win gene name
    ) -> Result<()> {
        ticket::buy(ctx,name)
    }

    ///claim the token if recorded.
    pub fn claim(
        ctx: Context<ApproveLucky>,
        md5:String,                 //value MD5(name + signature)
        name:String,                //win gene name
        signature:String            //win signature of transaction
    ) -> Result<()> {
        claim::entry(ctx,md5,name,signature)
    }

    ///migrate fee recipient
    pub fn migrate(
        ctx: Context<ManagerSystem>,
        recipient:String
    ) -> Result<()> {
        identity::migrate(ctx,recipient)
    }

    ///add manager white list, for approvers
    pub fn add(
        ctx: Context<ManagerSystem>,
        manager:String
    ) -> Result<()> {
        identity::add(ctx,manager)
    }

    ///remove manager from white list
    pub fn remove(
        ctx: Context<ManagerSystem>,
        manager:String
    ) -> Result<()> {
        identity::remove(ctx,manager)
    }

    ///DEBUG only, disable gene
    ///important, only on Devnet
    pub fn disable(
        ctx: Context<MangeGene>, 
        name:String, 
    ) -> Result<()> {
        enable::disable(ctx,name)
    }

    ///DEBUG only, set gene minted amount
    ///important, only on Devnet
    pub fn limit(
        ctx: Context<MangeCounter>, 
        name:String, 
    ) -> Result<()> {
        enable::limit(ctx,name)
    }

    ///DEBUG only, set gene minted amount
    ///important, only on Devnet
    pub fn  max(
        ctx: Context<MangeMax>,
    ) -> Result<()> {
        enable::max(ctx)
    }

    ///DEBUG only, set gene minted amount
    ///important, only on Devnet
    pub fn  set(
        ctx: Context<MangeCounter>,
        name:String, 
        gene:u64,
        luck:u64,
    ) -> Result<()> {
        enable::set(ctx,name,gene,luck)
    }
}
