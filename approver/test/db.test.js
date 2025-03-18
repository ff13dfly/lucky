const DB=require("../lib/db");

//1.(name, signature) sample
const name="tree";
const hash="4s1txfoogPrYvawdKC4bfQ4prbvRCzpdU6b7aB1SqAwBd2upByYD2njo16yDb6TpgcchVZWk734A8dsm932faMCL";
const address="6UyibmVxvrSREvDeDotj9mBEH8jwyzuB6VAbRcZDe7Qf";
const spam="aaabbbccc"

// DB.signature.get(hash,(res)=>{
//     console.log(res);
// });

// const status=DB.status("win");
// DB.signature.update(hash,name,status,(res)=>{
//     console.log(res);
// });

// DB.signature.add(hash,name,(res)=>{
//     console.log(res);
// });

// DB.account.push(address,name,hash,(res)=>{
//     console.log(res);
// });

// DB.request.set(spam,hash,(res)=>{
//     console.log(res);
// });

DB.request.get(spam,(res)=>{
    console.log(res);
});