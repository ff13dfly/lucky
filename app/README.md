# LuckySig DApp

* [https://solana.com/zh/developers/cookbook/wallets/connect-wallet-react#how-to-connect-to-a-wallet-with-react](https://solana.com/zh/developers/cookbook/wallets/connect-wallet-react#how-to-connect-to-a-wallet-with-react)

* webpack issue :[https://stackoverflow.com/questions/64557638/how-to-polyfill-node-core-modules-in-webpack-5](https://stackoverflow.com/questions/64557638/how-to-polyfill-node-core-modules-in-webpack-5)

* Frontend of Anchor [https://solana.com/zh/developers/guides/getstarted/full-stack-solana-development](https://solana.com/zh/developers/guides/getstarted/full-stack-solana-development)

Error
`BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.`

`yarn add --dev react-app-rewired crypto-browserify stream-browserify assert stream-http https-browserify os-browserify url buffer process browserify-zlib vm-browserify`

* Get IDL from program `anchor idl fetch -o idl.json FSkZpauodTvNQzy5v5MisEJ17FT1QNT3mwGz4MGCDrdR`.

* Check program status `solana program show FSkZpauodTvNQzy5v5MisEJ17FT1QNT3mwGz4MGCDrdR`.

* Show content of program `solana account FSkZpauodTvNQzy5v5MisEJ17FT1QNT3mwGz4MGCDrdR --output json`.