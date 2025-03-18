use std::str::FromStr;
use anchor_lang::prelude::*;
use crate::constants::{
    SOLANA_PDA_LEN,
    RegistryName,
    WhiteList,
    GeneData,
    LuckCounter,
    GeneCounter,
    LuckyRecord,
    LS_MAX_AMOUNT_OF_SINGLE_GENE,
    LS_LUCK_MAX_AMOINT,
    LS_SEEDS_NAME_LIST,
    LS_SEEDS_WHITE_LIST,
    LS_SEEDS_GENE_DATA,
    LS_SEEDS_GENE_SUPPLY_COUNTER,
    LS_SEEDS_TOTAL_SUPPLY_COUNTER,
    LS_SEEDS_APPROVE_RECORD,
};

/********************************************************************/
/************************ Public Functions **************************/
/********************************************************************/

///!important, most important method of LuckySig system.
/// As there is no way to get the transaction details via signature in program, need `approve` to record winner
/// Only account in whitelist can approve the winner
/// _md5 is neccessary, because it is included in the seeds of PDA account to record winner.
/// Functions
/// 1. record the winner on PDA account. It is used for `claim` to mint out the token actually.
pub fn entry(
    ctx: Context<RecordLucky>,      //default from system
    _md5:String,                    //md5(name+signature)
    name:String,                    //name of gene
    signature:String,               //target transaction signature
    owner:String,                   //signature owner pubkey string
) -> Result<()> {
    
    //0.input check
    //0.1. wether all token is minted out
    if *&ctx.accounts.luck_counter.value >=  LS_LUCK_MAX_AMOINT{
        return Err(ErrorCode::LuckySigClosed.into());
    }

    //0.2. wether gene token is minted out
    if *&ctx.accounts.gene_counter.value >=  LS_MAX_AMOUNT_OF_SINGLE_GENE{
        return Err(ErrorCode::GeneOut.into());
    }

    //0.2. check wether valid MD5 value
    //TODO, more check here, check MD5(name+signture)===_md5
    
    //0.3. name LuckySig exsist
    let registry = &ctx.accounts.map_account;
    if !is_exsist_name(registry,&name) {
        return Err(ErrorCode::InvalidName.into());
    }

    //0.4. signature length check
    if !is_valid_signature(signature.as_ref()){
        return Err(ErrorCode::InvalidSignature.into());
    }

    //0.5. owner length check
    if !is_valid_pubkey(owner.as_ref()) {
        return Err(ErrorCode::InvalidOwner.into());
    }

    //0.6. approver whitelist check
    let signer_key= &ctx.accounts.payer.key.to_string();
    if !is_manager(&ctx.accounts.whitelist_account,signer_key) {
        return Err(ErrorCode::NotManager.into());
    }

    //0.7. wether gene closed
    if ctx.accounts.gene_account.close == true {
        return Err(ErrorCode::ClosedGene.into());
    }

    //0.8. wether approved
    if !*&ctx.accounts.record_account.owner.is_empty() {
        return Err(ErrorCode::AlreadyDone.into());
    }

    //1.save record
    let win = &mut ctx.accounts.record_account;
    win.owner=owner;

    Ok(())
}

/********************************************************************/
/*********************** Private Functions **************************/
/********************************************************************/

fn is_exsist_name(registry:&Account<'_, RegistryName>,name:&String) -> bool{
    for ename in &registry.data {
        if ename == name {
            return true;
        }
    }
    return false;
}

fn is_manager(whitelist:&Account<'_, WhiteList>,pubkey:&str) -> bool{
    for manager in &whitelist.data {
        if manager == pubkey {
            return true;
        }
    }
    return false;
}

fn is_valid_signature(signature: &str) -> bool {
    bs58::decode(signature).into_vec().is_ok()
}

fn is_valid_pubkey(pubkey_str: &str) -> bool {
    Pubkey::from_str(pubkey_str).is_ok()
}

/********************************************************************/
/************************* Data Structure ***************************/
/********************************************************************/

#[derive(Accounts)]
#[instruction(md5:String,name:String,signature:String,owner:String)]
pub struct RecordLucky<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /**** PDA accounts ****/
    /// LUCK gene name list
    #[account(mut,seeds = [LS_SEEDS_NAME_LIST],bump)]
    pub map_account: Account<'info, RegistryName>,

    /// Whitelist of manager which can approve the signature, first one is ROOT
    #[account(mut,seeds = [LS_SEEDS_WHITE_LIST],bump)]
    pub whitelist_account: Account<'info, WhiteList>,

    /// Gene raw data account, compact iNFT format
    #[account(mut,seeds = [LS_SEEDS_GENE_DATA,name.as_bytes()],bump)]
    pub gene_account: Account<'info, GeneData>,

    /// Counter of gene, limit the supply of single gene
    #[account(mut,seeds = [LS_SEEDS_GENE_SUPPLY_COUNTER,name.as_bytes()],bump)]
    pub gene_counter: Account<'info, GeneCounter>,

    /// Counter of LUCK, limit the total supply
    #[account(mut,seeds = [LS_SEEDS_TOTAL_SUPPLY_COUNTER],bump)]
    pub luck_counter: Account<'info, LuckCounter >,

    /// Record of approve result, storage the owner of transaction signature.
    #[account(
        init_if_needed,
        space = SOLANA_PDA_LEN + LuckyRecord::INIT_SPACE,
        payer = payer,
        seeds = [
            md5.as_bytes(),
            LS_SEEDS_APPROVE_RECORD,
        ],
        bump,
    )]
    pub record_account: Account<'info, LuckyRecord >, 

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid name.")]
    InvalidName,

    #[msg("Signature is not BS58 code.")]
    InvalidSignature,

    #[msg("Invalid public key.")]
    InvalidOwner,

    #[msg("Already approved.")]
    AlreadyDone,

    #[msg("Not the manage account.")]
    NotManager,

    #[msg("All token is minted out.")]
    LuckySigClosed,

    #[msg("This gene is closed.")]
    ClosedGene,

    #[msg("This gene is out of minting.")]
    GeneOut,
}