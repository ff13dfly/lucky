use {
    anchor_lang::prelude::*,
    anchor_spl::{
        token::{Mint, Token, TokenAccount},
        associated_token::AssociatedToken,
    },
    anchor_lang::system_program,
};

use crate::constants::{
    SOLANA_PDA_LEN,
    RegistryName,
    TicketRecord,
    LS_SEEDS_NAME_LIST,
    LS_SEEDS_TOKEN_CREATOR,
    LS_TICKET_FEE,
};

/********************************************************************/
/************************ Public Functions **************************/
/********************************************************************/

///!important, buy ticket of gene.
/// To avoid stack error, seperate out `buy` method to init payer token account.
/// Functions
/// 1. Record the ticket status.
/// 2. Pay the fee to both recipient and creator of gene.
pub fn buy(
    ctx: Context<BuyTicket>,        //default from system
    name:String,                    //name of gene
) -> Result<()> {

    //0.input check
    //0.1. name LuckySig exsist
    let registry = &ctx.accounts.map_account;
    let gene=swap_case(name);

    if !is_exsist_name(registry,&gene) {
        return Err(Errors::InvalidName.into());
    }

    //1.buy ticket
    //1.1. pay ticket fee
    let ticket = &mut ctx.accounts.ticket_account;
    if !ticket.bought {
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.recipient.to_account_info(),
                },
            ),
            LS_TICKET_FEE,
        )?;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.creator.to_account_info(),
                },
            ),
            LS_TICKET_FEE,
        )?;
    }
    ticket.bought=true;

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
#[instruction(name:String)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /**** accounts from frontend ****/
    /// Creator of gene, to receive LUCK token.
    #[account(mut)]
    pub creator: SystemAccount<'info>,

    /// Fee recipient of LuckySig.
    #[account(mut)]
    pub recipient: SystemAccount<'info>,

    /// PDA accounts
    #[account(mut,seeds = [LS_SEEDS_NAME_LIST],bump)]
    pub map_account: Box<Account<'info, RegistryName>>,      //account to save all tokens record
    
    /**** PDA accounts ****/
    /// Ticket record of single gene.
    #[account(
        init_if_needed,
        space = SOLANA_PDA_LEN + TicketRecord::INIT_SPACE,
        payer = payer,
        seeds = [
            name.as_bytes(),
            payer.key.as_ref()
        ],
        bump,
    )]
    pub ticket_account: Account<'info, TicketRecord >,

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
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = payer,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum Errors {
    #[msg("Invalid name.")]
    InvalidName,
}