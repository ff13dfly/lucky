use std::str::FromStr;
use anchor_lang::prelude::*;
use crate::constants::{
    WhiteList,
    LS_ROOT_ACCOUNT,
    LS_SEEDS_WHITE_LIST,
};

/********************************************************************/
/************************ Public Functions **************************/
/********************************************************************/

//add record account 
pub fn add(
    ctx: Context<ManagerSystem>,     //default from system
    manager:String,               //manager pubkey string
) -> Result<()> {
    //0.input check
    //0.1. manager public key check
    if !is_valid_pubkey(manager.as_ref()) {
        return Err(ErrorCode::InvalidPubkey.into());
    }
    
    //0.2. wether root account
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotRoot));
    }

    //0.3. wether exsist account
    let list = &ctx.accounts.whitelist_account;
    if is_exsist_account(list,&manager){
        return Err(error!(ErrorCode::AccountExsist));
    }

    //1.add account 
    let whitelist = &mut ctx.accounts.whitelist_account;
    whitelist.push(manager);
    
    Ok(())
}

//remove record approver account
pub fn remove(
    ctx: Context<ManagerSystem>,     //default from system
    manager:String,                    //name of luck
) -> Result<()> {

    //0.input check
    //0.1. manager public key check
    if !is_valid_pubkey(manager.as_ref()) {
        return Err(ErrorCode::InvalidPubkey.into());
    }
    //0.2. wether root account
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotRoot));
    }

    //0.3. wether exsist account
    let list = &ctx.accounts.whitelist_account;
    if !is_exsist_account(list,&manager){
        return Err(error!(ErrorCode::AccountExsist));
    }

    //1.add account 
    let whitelist = &mut ctx.accounts.whitelist_account;
    whitelist.remove(manager);

    Ok(())
}

//replace the root account `whitelist[0]`
pub fn replace(
    ctx: Context<ManagerSystem>,     //default from system
    root:String,                     //pubkey of new root
) -> Result<()> {

    //0.input check
    //0.1. root public key check
    if !is_valid_pubkey(root.as_ref()) {
        return Err(ErrorCode::InvalidRoot.into());
    }

    //1.replace root account 
    let whitelist = &mut ctx.accounts.whitelist_account;
    whitelist.replace(root);
    
    Ok(())
}

//reset the fee recipient account
pub fn migrate(
    ctx: Context<ManagerSystem>,     //default from system
    recipient:String,                //pubkey of new fee recipient
) -> Result<()> {
    //0.input check
    //0.1. recipient public key check
    if !is_valid_pubkey(recipient.as_ref()) {
        return Err(ErrorCode::InvalidPubkey.into());
    }

    //0.2. signer wether root account
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotRoot));
    }

    //1. modify the recipient
    let target = &mut ctx.accounts.whitelist_account;
    target.recipient(recipient);
    
    Ok(())
}


/********************************************************************/
/*********************** Private Functions **************************/
/********************************************************************/

fn is_valid_pubkey(pubkey_str: &str) -> bool {
    Pubkey::from_str(pubkey_str).is_ok()
}

fn is_root_account(check_pubkey:Pubkey, root:&str) -> bool{
    let manage_pubkey = Pubkey::from_str(root).expect("Invalid pubkey");
    if check_pubkey != manage_pubkey {
        return false;
    }
    return true;
}

fn is_exsist_account(list:&Account<'_, WhiteList>,manager:&String) -> bool{
    for mm in &list.data {
        if mm == manager {
            return true;
        }
    }
    return false;
}


/********************************************************************/
/************************* Data Structure ***************************/
/********************************************************************/
#[derive(Accounts)]
pub struct ManagerSystem<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account(mut,seeds = [LS_SEEDS_WHITE_LIST],bump)]
    pub whitelist_account: Account<'info, WhiteList>,      //account to save all tokens record

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid name.")]
    InvalidName,

    #[msg("Invalid public key.")]
    InvalidPubkey,

    #[msg("Not the root account.")]
    NotRoot,

    #[msg("Account exsist already.")]
    AccountExsist,

    #[msg("No such manager account.")]
    InvalidManager,

    #[msg("Invalid root pubkey.")]
    InvalidRoot,
}
