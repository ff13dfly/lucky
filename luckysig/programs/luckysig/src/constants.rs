use anchor_lang::prelude::*;

///Accounts space setting
pub const ANCHOR_DESCRIMINATOR_SIZE: usize = 8;
pub const SOLANA_PDA_LEN:usize=8;
pub const LS_NAME_MAP_SIZE:usize=1000;          //name map size
pub const LS_WHITELIST_MAP_SIZE:usize=1000;     //whitelist map size

///Fees of SOL setting
pub const LS_TICKET_FEE:u64= 2_000_000;             // 0.02 SOL as ticket ( 200 users to get publish fee back )
pub const LS_NEW_GENE_FEE:u64=4_000_000_000;        // 4 SOL as fee of new gene

///Basic token setting
pub const LS_BLOCK_DEFAULT_OFFSET:u32= 60;              //offset to get the block hash
pub const LS_MINT_RATE:u32=100;                         //win rate 1/100
pub const LS_MINT_AMOUNT:u64= 97;                       //97% to signer
pub const LS_MINT_CREATOR_AMOUNT:u64= 3;                //3% to creator of gene
pub const LS_CRTEATOR_TOKEN_AMOUNT:u64=10_000;          //0.5% to creator
pub const LS_MAX_AMOUNT_OF_SINGLE_GENE:u64=20_000_000;  //20000000 per gene
pub const LS_LUCK_MAX_AMOINT:u64=20_000_000_000;        //Max supply of LUCK
pub const LS_ROOT_ACCOUNT:&str="GTNgXEzmG2E2d9yX8fwueP4bD2WCgJ3mqvt7sQj6CYYr";             //root of LuckySig program

///PDA accounts seeds
pub const LS_SEEDS_TOKEN_CREATOR:&[u8;18]=b"luck_token_creator";
pub const LS_SEEDS_TOKEN_METADATA:&[u8;8]=b"metadata";
pub const LS_SEEDS_NAME_LIST:&[u8; 12]=b"luck_mapping";
pub const LS_SEEDS_WHITE_LIST:&[u8; 13]=b"whitelist_vec";
pub const LS_SEEDS_TOTAL_SUPPLY_COUNTER:&[u8; 12]=b"luck_counter";
pub const LS_SEEDS_GENE_DATA:&[u8; 20]=b"gene_storage_account";
pub const LS_SEEDS_GENE_SUPPLY_COUNTER:&[u8; 12]=b"gene_counter";
pub const LS_SEEDS_APPROVE_RECORD:&[u8; 7]=b"approve";
pub const LS_SEEDS_CLAIM_RECORD:&[u8; 5]=b"claim";

//gene data on chain, can be used to check the result of LyckySig
#[account]
pub struct GeneData {
    pub data: String,
    pub offset: u32,        //offset to get the block hash
    pub creator: String,    //creator of gene to accept token
    pub close: bool,        //wether close to mint
}

impl GeneData {
    pub fn enable(&mut self) {
        self.close = false
    }

    ///!important, only on Devnet
    //FIXME, DEBUG only, need to remove when deploy on mainnet
    pub fn disable(&mut self) {
        self.close = true
    }
}

//single gene mint out amout, used to control the token supply of single gene
#[account]
#[derive(InitSpace)]
pub struct GeneCounter {
    pub value: u64,
}

impl GeneCounter {
    pub fn inc(&mut self, amount:u64) {
        self.value += amount
    }

    ///!important, only on Devnet
    //FIXME, DEBUG only, need to remove when deploy on mainnet
    pub fn set(&mut self, amount:u64) {
        self.value = amount
    }

    ///!important, only on Devnet
    //FIXME, DEBUG only, need to remove when deploy on mainnet
    pub fn max(&mut self) {
        self.value = LS_MAX_AMOUNT_OF_SINGLE_GENE
    }
}

//the total supply of LUCK token
#[account]
#[derive(InitSpace)]
pub struct LuckCounter {
    pub value: u64,
}
impl LuckCounter {
    pub fn inc(&mut self, amount:u64) {
        self.value += amount
    }

    ///!important, only on Devnet
    //FIXME, DEBUG only, need to remove when deploy on mainnet
    pub fn set(&mut self, amount:u64) {
        self.value = amount
    }

    ///!important, only on Devnet
    //FIXME, DEBUG only, need to remove when deploy on mainnet
    pub fn max(&mut self) {
        self.value = LS_LUCK_MAX_AMOINT
    }
}

//the tag after claiming token
#[account]
#[derive(InitSpace)]
pub struct ClaimRecord {
    pub done: bool,
}

//the tag of approving
#[account]
#[derive(InitSpace)]
pub struct LuckyRecord {
    #[max_len(50)]
    pub owner: String,
}

#[account]
#[derive(InitSpace)]
pub struct TicketRecord {
    pub bought: bool,
}


//the list of all LuckySig gene names.
#[account]
pub struct RegistryName {
    pub data: Vec<String>,
    pub initialized: bool,
}
impl RegistryName {
    pub fn push(&mut self,name:String) {
        self.data.push(name)
    }
}

//whitelist of managers, allow to approve the LuckySig
#[account]
pub struct WhiteList{
    pub data: Vec<String>,
    pub recipient:String,
}

impl WhiteList {
    pub fn push(&mut self, manager:String) {
        self.data.push(manager)
    }

    pub fn replace(&mut self, root:String) {
        self.data[0] = root
    }
    
    pub fn remove(&mut self,manager:String) {
        self.data.retain(|p| p != &manager);
    }

    pub fn recipient(&mut self,recipient:String){
        self.recipient = recipient
    }
}