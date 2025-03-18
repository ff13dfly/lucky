const Solana=require("../lib/solana");

const path="../lib/private.json";
const pair=Solana.getKeypairFromFile(path);

console.log(pair.publicKey.toString());

