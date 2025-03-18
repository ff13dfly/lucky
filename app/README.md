# LuckySig DApp

* [https://solana.com/zh/developers/cookbook/wallets/connect-wallet-react#how-to-connect-to-a-wallet-with-react](https://solana.com/zh/developers/cookbook/wallets/connect-wallet-react#how-to-connect-to-a-wallet-with-react)

* 解决问题说明:[https://stackoverflow.com/questions/64557638/how-to-polyfill-node-core-modules-in-webpack-5](https://stackoverflow.com/questions/64557638/how-to-polyfill-node-core-modules-in-webpack-5)

* React项目：[https://solana.com/zh/developers/guides/getstarted/full-stack-solana-development](https://solana.com/zh/developers/guides/getstarted/full-stack-solana-development)

Error
`BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.`

`yarn add --dev react-app-rewired crypto-browserify stream-browserify assert stream-http https-browserify os-browserify url buffer process browserify-zlib vm-browserify`

* 重新获取idl的方法`anchor idl fetch -o idl.json FSkZpauodTvNQzy5v5MisEJ17FT1QNT3mwGz4MGCDrdR`.

* 检查合约是否正常的命令`solana program show FSkZpauodTvNQzy5v5MisEJ17FT1QNT3mwGz4MGCDrdR`.

* 查看合约内容`solana account FSkZpauodTvNQzy5v5MisEJ17FT1QNT3mwGz4MGCDrdR --output json`.