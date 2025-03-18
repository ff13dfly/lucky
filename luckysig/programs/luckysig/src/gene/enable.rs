use std::str::FromStr;
use anchor_lang::prelude::*;
use crate::constants::{
    RegistryName,
    GeneData,
    LuckCounter,
    GeneCounter,
    LS_ROOT_ACCOUNT,
    LS_SEEDS_GENE_DATA,
    LS_SEEDS_NAME_LIST,
    LS_SEEDS_TOTAL_SUPPLY_COUNTER,
    LS_SEEDS_GENE_SUPPLY_COUNTER,
};

///!important, compact gene data on chain. Can be checked by IPFS record.
/// The gene format is a bit complex, if program failed to check, the LuckySig system will be crupt.
/// Only root account can enable the gene as normal to mint out LUCK. It is manual, not good but work.
/// Functions
/// 1.Enable target gene. Not convert to lowcase here, need call with the right name of gene.
pub fn entry(
    ctx: Context<MangeGene>,     //default from system
    name:String,                 //name of gene to close
) -> Result<()> {
    //0.input check
    //0.1. check wether manage account
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotManager));
    }

    //0.2. name LuckySig exsist
    let registry = &ctx.accounts.map_account;
    if !is_valid_name(registry,&name) {
        return Err(ErrorCode::NotExsistName.into());
    }

    //1.update the status
    let gene = &mut ctx.accounts.gene_account;
    gene.enable();

    Ok(())
}

///!important, only on Devnet
///FIXME, DEBUG only, need to remove when deploy on mainnet
pub fn disable(
    ctx: Context<MangeGene>,     //default from system
    name:String,                    //name of gene to close
) -> Result<()> {
    //0.input check
    //0.1. check wether manage account
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotManager));
    }

    //0.2. name LuckySig exsist
    let registry = &ctx.accounts.map_account;
    if !is_valid_name(registry,&name) {
        return Err(ErrorCode::NotExsistName.into());
    }

    //1.update the status
    let gene = &mut ctx.accounts.gene_account;
    gene.disable();

    Ok(())
}

///!important, only on Devnet
///FIXME, DEBUG only, need to remove when deploy on mainnet
pub fn limit(
    ctx: Context<MangeCounter>,     //default from system
    name:String,                    //name of gene to close
) -> Result<()> {
    
    //0.1. check wether manage account
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotManager));
    }

    //0.2. name LuckySig exsist
    let registry = &ctx.accounts.map_account;
    if !is_valid_name(registry,&name) {
        return Err(ErrorCode::NotExsistName.into());
    }

    //1. set single gene supply to max. For closing gene test.
    let counter = &mut ctx.accounts.gene_counter;
    counter.max();
    Ok(())
}

///!important, only on Devnet
///FIXME, DEBUG only, need to remove when deploy on mainnet
pub fn max(
    ctx: Context<MangeMax>,     //default from system
) -> Result<()> {
    //0.1. check wether manage account
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotManager));
    }

    //1.set luck total supply to max. For closing project test.
    let counter = &mut ctx.accounts.luck_counter;
    counter.max();
    Ok(())
}

///!important, only on Devnet
///FIXME, DEBUG only, need to remove when deploy on mainnet
pub fn set(
    ctx: Context<MangeCounter>,     //default from system
    name:String,
    gene:u64,
    luck:u64
) -> Result<()> {

    //0.input check
    //0.1. check wether manage account
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotManager));
    }

    //0.2. name LuckySig exsist
    let registry = &ctx.accounts.map_account;
    if !is_valid_name(registry,&name) {
        return Err(ErrorCode::NotExsistName.into());
    }

    //1.modify token amount
    //1.1.modify gene data
    let counter = &mut ctx.accounts.gene_counter;
    counter.set(gene);

    //1.2.modify luck total supply
    let total = &mut ctx.accounts.luck_counter;
    total.set(luck);
    Ok(())
}

/********************************************************************/
/*********************** Private Functions **************************/
/********************************************************************/

fn is_root_account(check_pubkey:Pubkey,root:&str) -> bool{
    let pubkey = solana_program::pubkey::Pubkey::from_str(root).expect("Invalid pubkey");
    let pubkey_bytes: [u8; 32] = pubkey.to_bytes();
    let manage_pubkey = anchor_lang::prelude::Pubkey::new_from_array(pubkey_bytes);
    if check_pubkey != manage_pubkey {
        return false;
    }
    return true;
}

fn is_valid_name(registry:&Account<'_, RegistryName>,name:&String) -> bool{
    for ename in &registry.data {
        if ename == name {
            return true;
        }
    }
    return false;
}

/********************************************************************/
/************************* Data Structure ***************************/
/********************************************************************/

#[derive(Accounts)]
#[instruction(name:String)]
pub struct MangeGene<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut,seeds = [LS_SEEDS_NAME_LIST],bump)]
    pub map_account: Account<'info, RegistryName>,

    #[account(mut,seeds = [LS_SEEDS_GENE_DATA,name.as_bytes()],bump)]
    pub gene_account: Account<'info, GeneData>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name:String)]
pub struct MangeCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut,seeds = [LS_SEEDS_NAME_LIST],bump)]
    pub map_account: Account<'info, RegistryName>,

    #[account(mut,seeds = [LS_SEEDS_GENE_SUPPLY_COUNTER,name.as_bytes()],bump)]
    pub gene_counter: Account<'info, GeneCounter>, 

    #[account(mut,seeds = [LS_SEEDS_TOTAL_SUPPLY_COUNTER],bump)]
    pub luck_counter: Account<'info, LuckCounter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MangeMax<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut,seeds = [LS_SEEDS_TOTAL_SUPPLY_COUNTER],bump)]
    pub luck_counter: Account<'info, LuckCounter>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Exsist name, try other.")]
    NotExsistName,

    #[msg("Not the manage account.")]
    NotManager,
}