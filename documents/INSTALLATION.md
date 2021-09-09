## Installation

### Introduction

This document includes how to install the BOA-SDK-TS.    
In order for BOA-SDK-TS to be used, a sodium library is essential. 
You can refer to the original copy of this library here. https://github.com/jedisct1/libsodium.js   
BOA-SDK-TS can be used in mobile, web-browser, and PC.   
However, different types of libraries must be used for sodium libraries to be used on multiple platforms.   
Therefore, we wanted one BOA-SDK-TS to be used on different platforms.   
To do so, we have made sure the sodium library suitable for each platform is dynamically connected to the BOA-SDK-TS.   


###  Installation of BOA-SDK-TS for each platform
-   PC   

    -  Install
       ```
       npm install boa-sdk-ts --save 
       ```

-   Browser   

    -  Install
       ```
       git clone https://github.com/bosagora/boa-sdk-ts
       cd boa-sdk-ts
       npm install
       npm run browser
       ```
       `./dist/boa-sdk.js` is used.

-   Mobile   

    - Install
        ```
        npm install boa-sdk-ts --save 
        ```


### Installation of Sodium for each platform
-   PC   

    -  Install
       ```
       npm boa-sodium-ts --save
       ```

-   Browser   

    -  Install
       ```
       git clone https://github.com/bosagora/boa-sodium-ts
       cd boa-sodium-ts
       npm install
       npm run browser
       ```
       `./dist/boa-sodium.js` is used.

-   Mobile   

    - Install
        ```
        npm react-native-sodium-boa --save
        ```

### How to use BOA-SDK-TS for each platform
-   PC   
    -  Usage
        ```TypeScript
        import { BOASodium } from "boa-sodium-ts";
        import * as sdk from "boa-sdk-ts";
        
        if (!sdk.SodiumHelper.isAssigned())   
           sdk.SodiumHelper.assign(new BOASodium());
        sdk.SodiumHelper.init().then(() => {
            // TODO  add code
        });
        ```
-  Browser
    -  Usage
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
               .then(function() {
                   // TODO  add code
               });
         </script>
        </head>
        <body>
        </body>
        </html>
        ```
-  Mobile
    -  Usage
        ```TypeScript
        import { BOASodiumRN } from '../modules/crypto/BOASodiumRN';
        import * as boasdk from 'boa-sdk-ts';

        if (!boasdk.SodiumHelper.isAssigned())       
           boasdk.SodiumHelper.assign(new BOASodiumRN());
        // TODO  add code
       ```

       There is no need to run `SodiumHelper.init()` on mobile.
       The link address of the source of `BOASodiumRN` is as follows.
       https://github.com/bosagora/react-native-sodium-boa-example/blob/6e9353cb757fd89c37bd0e5b2e2fe572e43a329d/src/modules/crypto/BOASodiumRN.tsx


[SODIUM.md]: SODIUM.md
