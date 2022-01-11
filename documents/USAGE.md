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
            endpoint: {
                agora: "http://agora.bosagora.io:2826",
                stoa: "http://stoa.bosagora.io:3836",
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
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
                        endpoint: {
                            agora: "http://agora.bosagora.io:2826",
                            stoa: "http://stoa.bosagora.io:3836",
                        },
                        fee: BoaSdk.WalletTransactionFeeOption.Medium,
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
            endpoint: {
                agora: "http://agora.bosagora.io:2826",
                stoa: "http://stoa.bosagora.io:3836",
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
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
                        endpoint: {
                            agora: "http://agora.bosagora.io:2826",
                            stoa: "http://stoa.bosagora.io:3836",
                        },
                        fee: BoaSdk.WalletTransactionFeeOption.Medium,
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
            endpoint: {
                agora: "http://agora.bosagora.io:2826",
                stoa: "http://stoa.bosagora.io:3836",
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
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
                        endpoint: {
                            agora: "http://agora.bosagora.io:2826",
                            stoa: "http://stoa.bosagora.io:3836",
                        },
                        fee: BoaSdk.WalletTransactionFeeOption.Medium,
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
| Value | Code | Description                                                                                                   |
|:------------|:-----|:--------------------------------------------------------------------------------------------------------------|
|0|Success| The function was successfully executed.                                                                       |
|1001|FailedAccessToAgora| Failed access to Agora.                                                                                       |
|1002|FailedAccessToStoa| Failed access to Stoa.                                                                                        |
|1100|FailedRequestHeight| Failed to process a request for block height.                                                                 |
|1101|FailedRequestBalance| Failed to process a request for the balance of the account.                                                   |
|1104|FailedRequestUTXO| Failed to process a request for UTXO.                                                                         |
|1105|FailedRequestUTXOInfo| Failed to process a request for UTXO information.                                                             |
|1106|FailedRequestTransactionHistory| Failed to process a request for the history of the transactions.                                              |
|1107|FailedRequestTransactionPending| Failed to process a request for the list of the pending transactions.                                         |
|1108|FailedRequestTransactionDetail| Failed to process a request for the detail of a transaction.                                                  |
|1109|FailedRequestTransactionOverview| Failed to process a request for the overview of a transaction.                                                |
|1110|FailedRequestTransaction| Failed to process a request for a transaction.                                                                |
|1111|FailedRequestPendingTransaction| Failed to process a request for a pending transaction.                                                        |
|1112|FailedRequestTxFee| Failed to process a request for the fee of the transaction.                                                   |
|1113|FailedRequestVotingFee| Failed to process a request for voting fee.                                                                   |
|1114|FailedVerifyPayment| Failed to process a request for verify payment of the transaction.                                            |
|1200|NotExistReceiver| Not exists any receiver.                                                                                      |
|1201|NotEnoughAmount| Not enough amount.                                                                                            |
|1500|Cancel_NotAllowCoinbase| Transactions of type Coinbase cannot be canceled..                                                            |
|1501|Cancel_InvalidTransaction| This is not a valid transaction..                                                                             |
|1502|Cancel_NotAllowUnfreezing| Unfreeze transactions cannot be canceled.                                                                     |
|1503|Cancel_NotFoundUTXO| UTXO information not found.                                                                                   |
|1504|Cancel_UnsupportedLockType| This LockType not supported by cancel feature.                                                                |
|1505|Cancel_NotFoundKey| Secret key not found.                                                                                         |
|1506|Cancel_NotEnoughFee| Not enough fees are needed to cancel.                                                                         |
|1507|Cancel_NotAssignedTx| Not assigned a transaction.                                                                                   |
|1508|Cancel_CancellationTx| This is a cancellation transaction.                                                                           |
|1600|NotAssignedReceiver| Not assigned any receiver.                                                                                    |
|1601|NotAssignedReceiverAmount| Not assigned any receiver amount.                                                                             |
|1602|InsufficientAmount| Insufficient amount.                                                                                          |
|1603|ExistUnknownSecretKey| An account exists where the secret key is unknown.                                                            |
|1604|NotAssignedSender| Not assigned any sender.                                                                                      |
|1605|AmountIsZero| The amount to be transferred is zero.                                                                         |
|1700|Unfreeze_ExistNotFrozenUTXO| Among the entered UTXOs, there are some that are not frozen.                                                  |
|1701|Unfreeze_UnsupportedLockType| The key type of the entered UTXO is not supported by this function.                                           |
|1702|Unfreeze_NotUTXOOwnedAccount| This is not UTXO owned by a registered account.                                                               |
|1703|Unfreeze_NotFrozenUTXO| The entered UTXO is not frozen.                                                                               |
|1704|Unfreeze_NotFoundUTXO| The information on the entered UTXO could not be found on the server. Please check if it's already been used. |
|1705|Unfreeze_AlreadyAdded| The entered UTXO has already been added.                                                                      |
|1706|Unfreeze_NotAssignedUTXO| No frozen UTXO has been added.                                                                                |
|1800|FailedBuildTransaction| Among the entered UTXOs, there are some that are not frozen.                                                  |
|2000|FailedSendTx| Failed to process a transfer transaction.                                                                     |
|3000|InvalidPublicKey| This is not a valid public key.                                                                               |
|3001|InvalidPublicKeyLength| This is not a valid public key length.                                                                        |
|3002|InvalidPublicKeyFormat| This is not a valid public key format.                                                                        |
|3010|InvalidSecretKey| This is not a valid secret key.                                                                               |
|3011|InvalidSecretKeyLength| This is not a valid secret key length.                                                                        |
|3012|InvalidSecretKeyFormat| This is not a valid secret key format.                                                                        |
|3020|InvalidKeyPair| This is not a valid key pair.                                                                                 |
|3030|InvalidHash| This is not a valid hash.                                                                                     |
|3031|InvalidHashLength| This is not a valid hash length.                                                                              |
|3032|InvalidHashFormat| This is not a valid hash format.                                                                              |
|3040|InvalidAmount| This is not a valid amount.                                                                                   |
|3041|InvalidAmountFormat| This is not a valid amount format.                                                                            |
|9000|UnknownError| Unknown error occurred.                                                                                       |
|9100|SystemError| An unknown error has occurred.                                                                                        |

[Top](#introduction)
---

## WalletFeeOption
| Value | Code | Description |
|:-----|:------------|:------------|
|0|High|Among the fees offered by Stoa, the high fee are adopted and used for transfer.|
|1|Medium|The medium fee are adopted and used for transfer.|
|2|Low|The low fee are adopted and used for transfer.|

[Top](#introduction)
