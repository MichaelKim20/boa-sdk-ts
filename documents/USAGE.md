## Usage

### Introduction

This document is written to make it easier to use the ability to create accounts, transfer funds, and check balance using BOA-SDK-TS through sample code.
Most of the functions of this document use the class Wallet included in BOA-SDK-TS.
See Also : https://bosagora.github.io/boa-sdk-ts/classes/wallet.html

-  [Keypair](#keypair)  
-  [Balance](#balance)   
-  [Transfer](#transfer)  
-  [Freeze](#freeze)   
    
-  [Result Code](#walletresultcode)   
-  [Fee Option](#walletfeeoption)   

### Keypair

This section explains how to create an account.   
There are two ways to create a key pair.  
The first way is to generate it randomly. This is used to create a new key pair for the first time.   
The second way is to use the previously generated secret key.   
This key pair contains a public key and a secret key and is available on the BOSAGORA network.  
The public key is the address of the account and is used as the address of the Agora node.   
The secret key is used for signatures, and the public key is used to verify the signature.

-   Sample Code (Node JS)
    
    ```TypeScript
    import { BOASodium } from "boa-sodium-ts";
    import * as sdk from "boa-sdk-ts";
    
    if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
    sdk.SodiumHelper.init().then(() => {
        const keypair = sdk.KeyPair.random();
        console.log(keypair.address.toString());
        console.log(keypair.secret.toString(false));

        const secret_key = keypair.secret.toString(false);

        const keypair2 = sdk.KeyPair.fromSeed(new sdk.SecretKey(secret_key));
        console.log(keypair2.address.toString());
        console.log(keypair2.secret.toString(false));
    });
    ```

-   Sample Code (Browser)
    
    ```HTML
    <!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <title>BOA SDK</title>
        <script type="text/javascript" src="boa-sodium.js"></script>
        <script type="text/javascript" src="boa-sdk.js"></script>
        <script>
            if (!BoaSdk.SodiumHelper.isAssigned())
                BoaSdk.SodiumHelper.assign(new BoaSodium.BOASodium());
            BoaSdk.SodiumHelper.init()
                .then(async function() {
                    const keypair = BoaSdk.KeyPair.random();
                    console.log(keypair.address.toString());
                    console.log(keypair.secret.toString(false));

                    const secret_key = keypair.secret.toString(false);
    
                    const keypair2 = BoaSdk.KeyPair.fromSeed(new BoaSdk.SecretKey(secret_key));
                    console.log(keypair2.address.toString());
                    console.log(keypair2.secret.toString(false));
                });
        </script>
    </head>
    <body>
    </body>
    </html>
    ```

-   Result
    
    ```
    boa1xzsu7zcp0lfmarkhpn6h3m5pgyvrntpjfnxpkx03n4nct9ylnpag2l0cpg4
    SDEKNGW5ESEZZEL64VE2QBKJIPJPZWWAWJVR6MD7EEPXYKABJ2FANZNQ
    boa1xzsu7zcp0lfmarkhpn6h3m5pgyvrntpjfnxpkx03n4nct9ylnpag2l0cpg4
    SDEKNGW5ESEZZEL64VE2QBKJIPJPZWWAWJVR6MD7EEPXYKABJ2FANZNQ
    ```

[Top](#introduction)

---

### Balance
    
This section explains how to check the balance of an account.  
Please refer to [this table](#walletresultcode) for more information on success or failure of execution results.  

See Also : https://bosagora.github.io/boa-sdk-ts/classes/wallet.html#getbalance

-   Sample Code (Node JS)
    
    ```TypeScript
    import { BOASodium } from "boa-sodium-ts";
    import * as sdk from "boa-sdk-ts";
    
    if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
    sdk.SodiumHelper.init().then(async () => {
        const keypair = sdk.KeyPair.fromSeed(new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ"));
    
        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://agora.bosagora.io:2826",
            stoaEndpoint: "http://stoa.bosagora.io:3836",
            fee: sdk.WalletFeeOption.Medium,
        });
    
        const res = await wallet.getBalance();
    
        console.log(res.code);
        console.log(res.message);
        console.log(res.data.balance.toString());
        console.log(res.data.spendable.toString());
        console.log(res.data.frozen.toString());
        console.log(res.data.locked.toString());
    });
    ```
    
-   Sample Code (Browser)

    ```HTML
    <!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <title>BOA SDK</title>
        <script type="text/javascript" src="boa-sodium.js"></script>
        <script type="text/javascript" src="boa-sdk.js"></script>
        <script>
            if (!BoaSdk.SodiumHelper.isAssigned())
                BoaSdk.SodiumHelper.assign(new BoaSodium.BOASodium());
            BoaSdk.SodiumHelper.init()
                .then(async function() {
                    const keypair = BoaSdk.KeyPair.fromSeed(new BoaSdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ"));
    
                    const wallet = new BoaSdk.Wallet(keypair, {
                        agoraEndpoint: "http://agora.bosagora.io:2826",
                        stoaEndpoint: "http://stoa.bosagora.io:3836",
                        fee: BoaSdk.WalletFeeOption.Medium,
                    });
    
                    const res = await wallet.getBalance();
    
                    console.log(res.code);
                    console.log(res.message);
                    console.log(res.data.balance.toString());
                    console.log(res.data.spendable.toString());
                    console.log(res.data.frozen.toString());
                    console.log(res.data.locked.toString());
                });
        </script>
    </head>
    <body>
    </body>
    </html>
    ```    


-   Result
    
    ```
    0
    Success
    400615078851560
    400615078851560
    0
    0
    ```
[Top](#introduction)  

---

### Transfer

This section explains how to transfer funds.   
The secret key of the account where the funds are withdrawn is required,    
and the account where the funds are entered only requires a public key (address).
First, assign the sodium library and create a class `Wallet` provided by BOA-SDK-TS.   
The endpoints of Agora and Stoa should be set.      
[Here](#walletfeeoption) is a description of the transaction fee.   
Please refer to [this table](#walletresultcode) for more information on success or failure of execution results.  

See Also : https://bosagora.github.io/boa-sdk-ts/classes/wallet.html#transfer

-   Sample Code (Node JS)
    
    ```TypeScript
    import { BOASodium } from "boa-sodium-ts";
    import * as sdk from "boa-sdk-ts";
    
    if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
    sdk.SodiumHelper.init().then(async () => {
        const keypair = sdk.KeyPair.fromSeed(new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ"));
    
        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://agora.bosagora.io:2826",
            stoaEndpoint: "http://stoa.bosagora.io:3836",
            fee: sdk.WalletFeeOption.Medium,
        });
    
        const res = await wallet.transfer([
          {
              address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
              amount: sdk.BOA(10),
          },
        ]);
    
        console.log(res.code);
        console.log(res.message);
    });
    ```

-   Sample Code (Browser)

    ```HTML
    <!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <title>BOA SDK</title>
        <script type="text/javascript" src="boa-sodium.js"></script>
        <script type="text/javascript" src="boa-sdk.js"></script>
        <script>
            if (!BoaSdk.SodiumHelper.isAssigned())
                BoaSdk.SodiumHelper.assign(new BoaSodium.BOASodium());
            BoaSdk.SodiumHelper.init()
                .then(async function() {
                    const keypair = BoaSdk.KeyPair.fromSeed(new BoaSdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ"));
    
                    const wallet = new BoaSdk.Wallet(keypair, {
                        agoraEndpoint: "http://agora.bosagora.io:2826",
                        stoaEndpoint: "http://stoa.bosagora.io:3836",
                        fee: BoaSdk.WalletFeeOption.Medium,
                    });
    
                    const res = await wallet.transfer([
                        {
                            address: new BoaSdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                            amount: BoaSdk.BOA(10),
                        },
                    ]);
    
                    console.log(res.code);
                    console.log(res.message);
                });
        </script>
    </head>
    <body>
    </body>
    </html>
    ```

-   Result
    
    ```
    0
    Success
    ```
[Top](#introduction)  


---

### Freeze

This section explains how to freeze funds in an account.   
In order to create a validator of Agora, more than 40,000 boa of funds must be frozen.   
In order to freeze funds to become a validator, the following two processes must be performed.   
The first is to create a new account.   
The second is to freeze and transfer funds to the newly created account.   
After that, it is transferred to the account while freezing the funds.   
Please refer to [this table](#walletresultcode) for more information on success or failure of execution results.  
 
See Also : https://bosagora.github.io/boa-sdk-ts/classes/wallet.html#freeze

-   Sample Code (Node JS)
    
    ```TypeScript
    import { BOASodium } from "boa-sodium-ts";
    import * as sdk from "boa-sdk-ts";
    
    if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
    sdk.SodiumHelper.init().then(async () => {
        const validator_keypair = sdk.KeyPair.random();
        console.log(validator_keypair.address.toString());
        console.log(validator_keypair.secret.toString(false));
    
        const keypair = sdk.KeyPair.fromSeed(new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ"));
    
        const wallet = new sdk.Wallet(keypair, {
            agoraEndpoint: "http://agora.bosagora.io:2826",
            stoaEndpoint: "http://stoa.bosagora.io:3836",
            fee: sdk.WalletFeeOption.Medium,
        });
    
        const res = await wallet.freeze({
            address: validator_keypair.address,
            amount: sdk.BOA(40000),
        });
    
        console.log(res.code);
        console.log(res.message);
    });
    ```

-   Sample Code (Browser)

    ```HTML
    <!DOCTYPE html>
    <head>
        <meta charset="UTF-8">
        <title>BOA SDK</title>
        <script type="text/javascript" src="boa-sodium.js"></script>
        <script type="text/javascript" src="boa-sdk.js"></script>
        <script>
            if (!BoaSdk.SodiumHelper.isAssigned())
                BoaSdk.SodiumHelper.assign(new BoaSodium.BOASodium());
            BoaSdk.SodiumHelper.init()
                .then(async function() {
                    const validator_keypair = BoaSdk.KeyPair.random();
                    console.log(validator_keypair.address.toString());
                    console.log(validator_keypair.secret.toString(false));
    
                    const keypair = BoaSdk.KeyPair.fromSeed(new BoaSdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ"));
    
                    const wallet = new BoaSdk.Wallet(keypair, {
                        agoraEndpoint: "http://agora.bosagora.io:2826",
                        stoaEndpoint: "http://stoa.bosagora.io:3836",
                        fee: BoaSdk.WalletFeeOption.Medium,
                    });
    
    
                    const res = await wallet.freeze({
                        address: validator_keypair.address,
                        amount: BoaSdk.BOA(40000),
                    });
    
                    console.log(res.code);
                    console.log(res.message);
                });
        </script>
    </head>
    <body>
    </body>
    </html>
    ```    
    
-   Result
    
    ```
    boa1xzsu7zcp0lfmarkhpn6h3m5pgyvrntpjfnxpkx03n4nct9ylnpag2l0cpg4
    SDEKNGW5ESEZZEL64VE2QBKJIPJPZWWAWJVR6MD7EEPXYKABJ2FANZNQ
    0
    Success
    ```
[Top](#introduction)  

---

### WalletResultCode
| Value | Code | Description |
|:-----|:------------|:------------|
|0|Success|The function was successfully executed.|
|1|FailedAccessToAgora|Failed access to Agora.|
|2|FailedAccessToStoa|Failed access to Stoa.|
|3|FailedRequestHeight|Failed to get the block height.|
|4|FailedRequestBalance|Failed to check the balance.|
|5|FailedRequestPendingTransaction|Failed to get the pending transaction.|
|6|FailedRequestUTXO|Failed to get the UTXO.|
|7|FailedRequestTxFee|Failed to get the fee of transaction.|
|8|FailedBuildTransaction|Failed to build the transaction.|
|9|NotExistReceiver|The recipient doesn't exist.|
|10|InvalidTransaction|It's an invalid transaction.|
|11|CoinbaseCanNotCancel|Coinbase transactions cannot be canceled.|
|12|UnsupportedUnfreezing|This is a case where unfreezing is not supported.|
|13|ExistNotFrozenUTXO|Frozen UTXO does not exist.|
|14|NotFoundUTXO|The required UTXO could not be found in the process of canceling the transaction.|
|15|UnsupportedLockType|An unsupported lock type was found in the process of canceling the transaction.|
|16|NotFoundKey|There is no secret key required in the process of canceling the transaction.|
|17|NotEnoughAmount|There is not enough balance to transfer funds.|
|18|NotEnoughFee|There is not enough fee required in the process of canceling the transaction.|
|19|FailedSendTx|It failed in the process of transmitting the transaction to Agora.|
|20|UnknownError|An unknown error has occurred.|

[Top](#introduction)
---

## WalletFeeOption
| Value | Code | Description |
|:-----|:------------|:------------|
|0|High|Among the fees offered by Stoa, the high fee are adopted and used for transfer.|
|1|Medium|The medium fee are adopted and used for transfer.|
|2|Low|The low fee are adopted and used for transfer.|

[Top](#introduction)
