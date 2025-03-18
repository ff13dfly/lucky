use {
    std::str::FromStr,
    anchor_lang::prelude::*,
    anchor_spl::{
        token::{MintTo,mint_to, Mint, Token, TokenAccount},
        associated_token::AssociatedToken,
    },
    anchor_lang::system_program,
};

use crate::constants::{
    SOLANA_PDA_LEN,
    RegistryName,
    WhiteList,
    GeneData,
    GeneCounter,
    LuckCounter,
    LS_MINT_RATE,
    LS_NEW_GENE_FEE,
    LS_BLOCK_DEFAULT_OFFSET,
    LS_LUCK_MAX_AMOINT,
    LS_CRTEATOR_TOKEN_AMOUNT,
    LS_SEEDS_GENE_DATA,
    LS_SEEDS_GENE_SUPPLY_COUNTER,
    LS_SEEDS_NAME_LIST,
    LS_SEEDS_WHITE_LIST,
    LS_SEEDS_TOTAL_SUPPLY_COUNTER,
    LS_SEEDS_TOKEN_CREATOR,
};
use crate::gene::{is_valid_gene};

/********************************************************************/
/************************ Public Functions **************************/
/********************************************************************/

///!important, compact gene data on chain. Can be checked by IPFS record.
/// As image is too large to storage on chain, only compact format of iNFT data is storaged on chain.
/// When create the gene successfully, "creator" payed SOL already. 
/// Even the data is invalid and never be enabled, "creator" can get LUCK token anyway.
/// At the same time, the associated token account is created here.
/// Functions
/// 1. Update gene list.
/// 2. Update counter of gene and LUCK.
/// 3. Pay the fee of creating new gene.
/// 4. Mint out the token to gene creator.
pub fn entry(
    ctx: Context<CreateLucky>,      //default from system
    name: String,                   //Gene name, lowercase,  3~5 Characters
    gene: String,                   //JSON format string, need to check carefully
    next:u32,                       //offset to get the next block, default 6
) -> Result<()> {

    //0.input check
    //0.1. wether project closed
    if *&ctx.accounts.luck_counter.value >=  LS_LUCK_MAX_AMOINT{
        return Err(ErrorCode::LuckySigClosed.into());
    }

    //0.2. name LuckySig exsist
    let gname = swap_case(name);
    let registry = &ctx.accounts.map_account;
    if !is_valid_name(registry,&gname) {
        return Err(ErrorCode::ExsistName.into());
    }

    //0.3. name length check
    let len=gname.len();
    if  len > 5  || len < 3 { 
        return Err(ErrorCode::NameTooLong.into());
    }

    //0.4. gene data format check
    if !is_valid_gene(gene.as_ref(), LS_MINT_RATE) {
        return Err(ErrorCode::InvalidGeneFormat.into());
    }
    
    //1.storage
    //1.1. update name list of LuckySig
    let saving = &mut ctx.accounts.map_account;
    saving.push(gname);     //lowcase name

    //1.2. gene data saved to account
    let data=gene;
    let offset= LS_BLOCK_DEFAULT_OFFSET + next;
    let close = true;
    let creator=ctx.accounts.payer.key().to_string();
    *ctx.accounts.gene_account= GeneData{
        data,
        offset,
        creator,
        close
    };

    //1.3. init the counter of gene
    let value:u64=LS_CRTEATOR_TOKEN_AMOUNT;
    *ctx.accounts.gene_counter= GeneCounter{
        value
    };

    //1.4. inc the total supply
    let luck = &mut ctx.accounts.luck_counter;
    luck.inc(value);

    //1.5. pay fee of new gene
    let fee_recipient=&ctx.accounts.whitelist_account.recipient;
    let check_pubkey = str_to_pubkey(fee_recipient)?;
    if check_pubkey != *ctx.accounts.recipient.key{
        return Err(ErrorCode::InvalidRecipient.into());
    }

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            },
        ),
        LS_NEW_GENE_FEE,
    )?;

    //1.6. mint out creating amount of LUCK
    let seed=LS_SEEDS_TOKEN_CREATOR;
    let signer_seeds: &[&[&[u8]]] = &[&[seed.as_ref(), &[ctx.bumps.mint_account]]];
    let amount = LS_CRTEATOR_TOKEN_AMOUNT * 10u64.pow(ctx.accounts.mint_account.decimals as u32);
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

    Ok(())
}

/********************************************************************/
/*********************** Private Functions **************************/
/********************************************************************/

fn is_valid_name(registry:&Account<'_, RegistryName>,name:&String) -> bool{
    for ename in &registry.data {
        if ename == name {
            return false;
        }
    }
    return true;
}

fn str_to_pubkey(key_str: &str) -> Result<Pubkey> {
    let pubkey = Pubkey::from_str(key_str).map_err(|_| error!(ErrorCode::InvalidPubkey))?;
    Ok(pubkey)
}

fn swap_case(s: String) -> String {
    s.chars()
        .map(|c| {
            if !c.is_ascii_lowercase() {
                c.to_ascii_lowercase()
            } else {
                c
            }
    })
    .collect()
}

/********************************************************************/
/************************* Data Structure ***************************/
/********************************************************************/

#[derive(Accounts)]
#[instruction(name:String, gene:String)]
pub struct CreateLucky<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /**** accounts from frontend ****/
    /// Fee recipient of LuckySig.
    #[account(mut)]
    pub recipient: SystemAccount<'info>,

    /**** PDA accounts ****/
    /// LUCK gene name list
    #[account(mut,seeds = [LS_SEEDS_NAME_LIST],bump)]
    pub map_account: Account<'info, RegistryName>,

    /// Whitelist of manager which can approve the signature, first one is ROOT
    #[account(mut,seeds = [LS_SEEDS_WHITE_LIST],bump)]
    pub whitelist_account: Account<'info, WhiteList>,

    /// Counter of LUCK, limit the total supply
    #[account(mut,seeds = [LS_SEEDS_TOTAL_SUPPLY_COUNTER],bump)]
    pub luck_counter: Account<'info, LuckCounter >,

    /// Gene raw data account, compact iNFT format
    #[account(
        init,
        space = SOLANA_PDA_LEN + gene.len() + 60 + 4 + 1 + 4 + 8,   //FIXME, how to improve code here?
        payer = payer,
        seeds = [
            LS_SEEDS_GENE_DATA,
            name.as_bytes()
        ],
        bump,
    )]
    pub gene_account: Account<'info, GeneData >,      //account to save gene template data

    /// Counter of gene, limit the supply of single gene
    #[account(
        init,
        space = SOLANA_PDA_LEN + GeneCounter::INIT_SPACE,
        payer = payer,
        seeds = [
            LS_SEEDS_GENE_SUPPLY_COUNTER,
            name.as_bytes()
        ],
        bump,
    )]
    pub gene_counter: Account<'info, GeneCounter >,      //account to save gene template data

    /**** token related accounts ****/
    /// Token creator account
    #[account(mut, seeds = [LS_SEEDS_TOKEN_CREATOR],bump)]
    pub mint_account: Account<'info, Mint>,

    /// Gene creator token account
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = payer,
    )]
    pub associated_creator_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Exsist name, try other.")]
    ExsistName,

    #[msg("Name length between 3 to 5.")]
    NameTooLong,

    #[msg("Not the manage account.")]
    NotManager,

    #[msg("Invalid creator pubkey.")]
    InvalidCreator,

    #[msg("Invalid pubkey.")]
    InvalidPubkey,

    #[msg("Invalid fee recipient.")]
    InvalidRecipient,

    #[msg("Invalid gene data string.")]
    InvalidGeneFormat,

    #[msg("All token is minted out.")]
    LuckySigClosed,
}