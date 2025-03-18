use bs58;
use std::str::FromStr;
use {
    anchor_lang::prelude::*,
    anchor_spl::{
        token::{mint_to,Mint,MintTo, Token, TokenAccount},
        associated_token::AssociatedToken,
    },
};
use crate::constants::{
    SOLANA_PDA_LEN,
    RegistryName,
    GeneData,
    GeneCounter,
    LuckCounter,
    LuckyRecord,
    ClaimRecord,
    TicketRecord,
    LS_MINT_AMOUNT,
    LS_MINT_CREATOR_AMOUNT,
    LS_MAX_AMOUNT_OF_SINGLE_GENE,
    LS_SEEDS_TOKEN_CREATOR,
    LS_SEEDS_NAME_LIST,
    LS_SEEDS_GENE_DATA,
    LS_SEEDS_GENE_SUPPLY_COUNTER,
    LS_SEEDS_TOTAL_SUPPLY_COUNTER,
    LS_SEEDS_APPROVE_RECORD,
    LS_SEEDS_CLAIM_RECORD,
};

/********************************************************************/
/************************ Public Functions **************************/
/********************************************************************/

///!important, no need to check the supply amount here. `approve` checked this.
/// To avoid stack error of anchor, seperate the ticket function out. 
/// `ticket` function can init the user token account, then no need here.
/// `create` function init the gene creator token account, then no need here.
/// Functions
/// 1.mint out token to "payer" and "creator";
/// 2.record the claim. As the MD5 value is coming from MD5(name+signature), no "name" as part of the PDA seeds.
/// 3.increase the counter of gene and LUCK
/// 4.if out of gene total supply close gene here. If closed, even approved token will not be claimed.
pub fn entry(
    ctx: Context<ApproveLucky>,     //default from system
    _md5:String,                    //key
    name:String,                    //name of gene
    signature: String,              //transaction signature
) -> Result<()> {

    //0.input check
    //0.1. name LuckySig exsist
    let registry = &ctx.accounts.map_account;
    if !is_exsist_name(registry,&name) {
        return Err(ErrorCode::InvalidName.into());
    }

    //0.2. signature length check
    if !is_valid_signature(signature.as_ref()){
        return Err(ErrorCode::InvalidSignature.into());
    }
    
    //0.3. check wether record exsist
    let data = &ctx.accounts.record_account;
    let key=Pubkey::from_str(data.owner.as_ref()).expect(&("Invalid pubkey:".to_owned() + &data.owner));
    if key != ctx.accounts.payer.key() {
        return Err(ErrorCode::InvalidOwner.into());
    }
    
    //0.4. check wether gene closed. Even there is record.
    if ctx.accounts.gene_account.close == true {
        return Err(ErrorCode::ClosedGene.into());
    }

    //0.5. check wether bought ticket
    let ticket = &mut ctx.accounts.ticket_account;
    if !ticket.bought {
        return Err(ErrorCode::NoTicket.into());
    }

    //0.6. check wether claimed
    let status = &mut ctx.accounts.claim_account;
    if status.done {
        return Err(error!(ErrorCode::AlreadyClaimed));
    }
    status.done=true;

    //1.1. mint out token to signer
    let seed=LS_SEEDS_TOKEN_CREATOR;
    let signer_seeds: &[&[&[u8]]] = &[&[seed.as_ref(), &[ctx.bumps.mint_account]]];
    let amount = LS_MINT_AMOUNT * 10u64.pow(ctx.accounts.mint_account.decimals as u32);
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.mint_account.to_account_info(), // PDA mint authority, required as signer
            },
        )
        .with_signer(signer_seeds), // using PDA to sign
        amount,     // Mint tokens, adjust for decimals
    )?;

    //1.2. mint out token to creator of gene ( 5% )
    let amount = LS_MINT_CREATOR_AMOUNT * 10u64.pow(ctx.accounts.mint_account.decimals as u32);
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.associated_creator_account.to_account_info(),
                authority: ctx.accounts.mint_account.to_account_info(), // PDA mint authority, required as signer
            },
        )
        .with_signer(signer_seeds), // using PDA to sign
        amount,     // Mint tokens, adjust for decimals
    )?;

    //1.3.update the amount of single gene
    let value:u64 = LS_MINT_CREATOR_AMOUNT + LS_MINT_AMOUNT;
    let counter = &mut ctx.accounts.gene_counter;
    counter.inc(value);

    //1.4. check wether to close gene
    if ctx.accounts.gene_counter.value >= LS_MAX_AMOUNT_OF_SINGLE_GENE {
        let gene = &mut ctx.accounts.gene_account;
        gene.disable();
    }

    //1.5. update LUCK total supply
    let more:u64 = LS_MINT_CREATOR_AMOUNT + LS_MINT_AMOUNT;
    let luck = &mut ctx.accounts.luck_counter;
    luck.inc(more);

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

fn is_valid_signature(signature: &str) -> bool {
    bs58::decode(signature).into_vec().is_ok()
}
/********************************************************************/
/************************* Data Structure ***************************/
/********************************************************************/

#[derive(Accounts)]
#[instruction(md5:String,name:String,signature:String)]
pub struct ApproveLucky<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /**** accounts from frontend ****/
    /// Creator of gene, to receive LUCK token.
    #[account(mut)]
    pub creator: SystemAccount<'info>,

    /**** PDA accounts ****/
    /// LUCK gene name list
    #[account(mut,seeds = [LS_SEEDS_NAME_LIST],bump)]
    pub map_account: Account<'info, RegistryName>,

    /// Gene raw data account, compact iNFT format
    #[account(mut,seeds = [LS_SEEDS_GENE_DATA,name.as_bytes()],bump)]
    pub gene_account: Account<'info, GeneData>,

    /// Counter of gene, limit the supply of single gene
    #[account(mut,seeds = [LS_SEEDS_GENE_SUPPLY_COUNTER,name.as_bytes()],bump)]
    pub gene_counter: Account<'info, GeneCounter>, 

    /// Counter of LUCK, limit the total supply
    #[account(mut,seeds = [LS_SEEDS_TOTAL_SUPPLY_COUNTER],bump)]
    pub luck_counter: Account<'info, LuckCounter>,

    /// Record of approve result, storage the owner of transaction signature.
    #[account(mut,seeds = [md5.as_bytes(),LS_SEEDS_APPROVE_RECORD],bump)]
    pub record_account: Account<'info, LuckyRecord >,

    /// Ticket record of single gene.
    #[account(mut,seeds = [name.as_bytes(),payer.key.as_ref()],bump)]
    pub ticket_account: Account<'info, TicketRecord >,

    /// Record of claim result.
    #[account(
        init_if_needed,
        space = SOLANA_PDA_LEN + ClaimRecord::INIT_SPACE,
        payer = payer,
        seeds = [
            md5.as_bytes(),
            LS_SEEDS_CLAIM_RECORD,
        ],
        bump,
    )]
    pub claim_account: Account<'info, ClaimRecord >,

    /**** token related accounts ****/
    /// Token creator account
    #[account(mut, seeds = [LS_SEEDS_TOKEN_CREATOR],bump)]
    pub mint_account: Account<'info, Mint>,

    /// Gene creator token account
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = creator,
    )]
    pub associated_creator_account: Account<'info, TokenAccount>,

    /// Payer token account
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = payer,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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

    #[msg("This gene is closed.")]
    ClosedGene,

    #[msg("Duplicate claim.")]
    AlreadyClaimed,

    #[msg("Not bought the ticket yet.")]
    NoTicket,

    #[msg("All token is minted out.")]
    LuckySigClosed,
}