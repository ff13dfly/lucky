use {
    anchor_lang::prelude::*,
    anchor_spl::{
        metadata::{
            create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
            CreateMetadataAccountsV3, Metadata,
        },
        token::{Mint, Token},
    },
};
use std::str::FromStr;

use crate::constants::{
    SOLANA_PDA_LEN,
    RegistryName,
    WhiteList,
    LuckCounter,
    LS_NAME_MAP_SIZE,
    LS_WHITELIST_MAP_SIZE,
    LS_ROOT_ACCOUNT,
    LS_SEEDS_NAME_LIST,
    LS_SEEDS_WHITE_LIST,
    LS_SEEDS_TOTAL_SUPPLY_COUNTER,
    LS_SEEDS_TOKEN_CREATOR,
    LS_SEEDS_TOKEN_METADATA,
};

/********************************************************************/
/************************ Public Functions **************************/
/********************************************************************/

///!important, prepare the basic env of LuckySig.
/// Need to avoid recall after init. Then the counter can not be reset.
/// "recipient" as the parameter make it easy to start the system without redeploy.
/// Functions
/// 1. Create gene name list, put "luck" and "lucky" in the list to avoid misunderstanding.
/// 2. Create whitelist of system, root account is defined as LS_ROOT_ACCOUNT in "constans.rs".
/// 3. Create LUCK counter to control the total supply.
/// 4. Create LUCK token as SPL token.
pub fn entry(
    ctx: Context<InitLucky>,        //default from system
    recipient:String,               //fee recipient
) -> Result<()> {

    //0.input check
    //0.1. check wether the root account to access
    let check_key = ctx.accounts.payer.key();
    if !is_root_account(check_key,LS_ROOT_ACCOUNT) {
        return Err(error!(ErrorCode::NotRoot));
    }

    //0.2. check wether inited.
    let map = &mut ctx.accounts.map_account;
    if map.initialized {
        return Err(error!(ErrorCode::AlreadyInited));
    }
    
    //1. storage accounts
    //1.1. name list account
    map.push(String::from("lucky"));
    map.push(String::from("luck"));
    map.initialized=true;

    //1.2. create the manage list account and set fee recipient
    let white = &mut ctx.accounts.whitelist_account;
    white.push(LS_ROOT_ACCOUNT.to_string());
    white.recipient(recipient);

    //1.3. init counter of LUCK
    let value:u64=0;
    *ctx.accounts.luck_counter= LuckCounter{
        value
    };

    //2. create `lucky` token
    //2.1. create PDA token for Lucky
    let signer_seeds: &[&[&[u8]]] = &[&[LS_SEEDS_TOKEN_CREATOR, &[ctx.bumps.mint_account]]];
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
                mint_authority: ctx.accounts.mint_account.to_account_info(),        // PDA is mint authority
                update_authority: ctx.accounts.mint_account.to_account_info(),      // PDA is update authority
                payer: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        DataV2 {
            name: String::from("Luck"),
            symbol: String::from("LUCK"),
            uri: String::from("https://token.luckysig.fun"),
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        false, // Is mutable
        true,  // Update authority is signer
        None,  // Collection details
    )?;

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

/********************************************************************/
/************************* Data Structure ***************************/
/********************************************************************/

#[derive(Accounts)]
#[instruction(recipient:String)]
pub struct InitLucky<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /**** PDA accounts ****/
    /// LUCK gene name list
    /// FIXME, as the list will be more, need to relocate the space
    #[account(
        init,
        space = SOLANA_PDA_LEN + LS_NAME_MAP_SIZE,     
        payer = payer,
        seeds = [LS_SEEDS_NAME_LIST],
        bump,
    )]
    pub map_account: Account<'info, RegistryName>,

    /// Whitelist of manager which can approve the signature, first one is ROOT
    /// FIXME, check the max space needed here.
    #[account(
        init,
        space = SOLANA_PDA_LEN + LS_WHITELIST_MAP_SIZE, 
        payer = payer,
        seeds = [LS_SEEDS_WHITE_LIST],
        bump,
    )]
    pub whitelist_account: Account<'info, WhiteList>,

    /// Counter of LUCK, limit the total supply
    #[account(
        init,
        space = SOLANA_PDA_LEN + LuckCounter::INIT_SPACE,
        payer = payer,
        seeds = [LS_SEEDS_TOTAL_SUPPLY_COUNTER],
        bump,
    )]
    pub luck_counter: Account<'info, LuckCounter >,

    /**** token related accounts ****/
    /// Token creator account
    #[account(
        init,
        seeds = [LS_SEEDS_TOKEN_CREATOR],
        bump,
        payer = payer,
        mint::decimals = 9,
        mint::authority = mint_account.key(),
        mint::freeze_authority = mint_account.key(),
    )]
    pub mint_account: Account<'info, Mint>,

    /// Token metadata account
    /// CHECK:
    /// FIXME, "UncheckedAccount" is not safe, without the "CHECK:" , there is compiling error.
    #[account(
        mut,
        seeds = [
            LS_SEEDS_TOKEN_METADATA,
            token_metadata_program.key().as_ref(),
            mint_account.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unexcept Error.")]
    UnexceptError,

    #[msg("Not root account.")]
    NotRoot,

    #[msg("Already inited.")]
    AlreadyInited,
}