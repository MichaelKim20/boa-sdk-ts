/*******************************************************************************

    Test for libsodium ported to TypeScript

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import {
    crypto_core_ed25519_BYTES,
    crypto_core_ed25519_UNIFORMBYTES,
    crypto_core_ed25519_HASHBYTES,
    crypto_core_ed25519_SCALARBYTES,
    crypto_core_ed25519_NONREDUCEDSCALARBYTES,

    FE25519,
    fe25519_tobytes,
    fe25519_frombytes,

    crypto_core_ed25519_random,
    crypto_core_ed25519_from_uniform,
    crypto_core_ed25519_add,
    crypto_core_ed25519_sub,
    crypto_core_ed25519_is_valid_point,
    crypto_core_ed25519_scalar_random,
    crypto_core_ed25519_scalar_add,
    crypto_core_ed25519_scalar_sub,
    crypto_core_ed25519_scalar_negate,
    crypto_core_ed25519_scalar_complement,
    crypto_core_ed25519_scalar_mul,
    crypto_core_ed25519_scalar_invert,
    crypto_core_ed25519_scalar_reduce,
    crypto_core_ed25519_scalar_is_canonical,
    
    JSBIUtils
} from '../../src/modules/crypto/'

import * as assert from 'assert';
import JSBI from 'jsbi';
import {Utils} from "../../src";

describe ('Test crypto_core', () =>
{
    let sample_random = [
        {
            random: '199d91ac71d6ae893ba9e9d267e9291fa3067f3d3099f3401f006a220ae245f2',
            crypto_core_ed25519_from_uniform: 'f297b423c6aed3b20cc75cd08d85d00a839de1b8baa0c4a2793df0c0edfe5105'
        },
        {
            random: '2de4c5e0794f015d9847da16ed0f546c03820a1dcf8f8014e6cb6e62a9f6e7aa',
            crypto_core_ed25519_from_uniform: 'e1a33d6667d4f0a942308ddccbac0d5f11190e0f973215b301f58c79e19555e6'
        },
        {
            random: '9fd6bdf35c3310fc2b82c38df74cb0d0a9a4e638bd0bf6f81e02467eaaac70f5',
            crypto_core_ed25519_from_uniform: '242d196c487d25c157b35bc27e50e0f4a02e164820b4af18af53acb8e3ea43fc'
        },
        {
            random: '82d28d1e5df4d6aa616fa4edb5ce9749e3b884a76bc029a163bd076fdcc2dc2c',
            crypto_core_ed25519_from_uniform: '94d62d5a3b1831a988efc46a66138dfe62ef81ec1b8b6e069127ad80bb92014a'
        },
        {
            random: 'ff28d03d9a912de49e42baba9b48deaba1b4feaa8ac4aef9f253c8be3b4128ae',
            crypto_core_ed25519_from_uniform: '9c338ec44535371882fb2ca97f5a6edeaa35f98a054b2b06f72dfdd138b69215'
        },
        {
            random: '81b0fdd48397484e7584cf4822313a265f1501c991add6035e907a3f4acd26c9',
            crypto_core_ed25519_from_uniform: '0ed590f1445abfef08864b950e5abb4d3250fb01dae4d139f2d1859810a6ba9a'
        },
        {
            random: 'f9a38460bfea952c45e5353bb02e3cf018292aedfa432b2905ee9215a38cd478',
            crypto_core_ed25519_from_uniform: '20f01c26b75cb961469d6e87b5a94ff778247e16c5f59a02f1662c53c051a6ce'
        },
        {
            random: '5bb00fc040c527106bd8a5349cc09034b96c64cdafc2feec0e70d5843fb850e8',
            crypto_core_ed25519_from_uniform: '53b89a65e2124900a4b6a955f897399330a631139ecb998fd64ad0eb9ab76883'
        },
        {
            random: '93efa741137fd501094f5198f4b5ae34d882cdb6d559ef9d27a4d1ecd87898f4',
            crypto_core_ed25519_from_uniform: 'df75209edfcfe45c22303b648d2767ccdc3e9590aaded3b6f2055f5d4b45d29c'
        },
        {
            random: 'fd7a498cf5b99ba16326f9ed4cd5a37e25df966cb99a19251749b743483dd00f',
            crypto_core_ed25519_from_uniform: '2e91601fcc1ca956910c3539858333847dc46c61c194a7bceafddbc39a2653d7'
        },
        {
            random: 'f1296fc4f9dca64f5c240b2faaf041b6e5d35f2218be53ba24f11d88af089b0a',
            crypto_core_ed25519_from_uniform: '8ee709f360d4e30ffc457776a12106d888fe261a00879b7933ad137108380e57'
        },
        {
            random: '32fad6a487756db944bb4b2d6cce458bb7fe2bf6abd520f68ad30d40c0fe9cc1',
            crypto_core_ed25519_from_uniform: 'd4d4857bbcb7046bd6d5d82cbfe8a69b5bb2d750c77e323f0a250e015dc7b00c'
        },
        {
            random: 'c8ade406c4d30cf66f0759ccb8204f085ec94c708add0e6e5b7a47cc89b8add9',
            crypto_core_ed25519_from_uniform: 'b1b928bfc5706451a47a6eb8e3704feadaed3259844c4b1a76b45f35757d2f0e'
        },
        {
            random: '50383b69c4a4fe1b067080c74a3100654a8caadb1b56954649b639fe02c040a0',
            crypto_core_ed25519_from_uniform: '456717aebfcafbd1d21003e2c9d408bf120fe6be92c3325a70ee4ec393db1972'
        },
        {
            random: '330e406d24f13120fed6c9d2321a9804b25abeedfed48a4a15289ec66540c71e',
            crypto_core_ed25519_from_uniform: '53061a333ff97b65c29090e94105e100d7068ca11228ebbe2576d229b8bc201e'
        },
        {
            random: '9b8e8190d6485d79e704187861a4a55cb213364bbe3baee13ec66057dc9b24af',
            crypto_core_ed25519_from_uniform: '54e76e72d1cefeea5872d6d6aa80aca158f299c8ece8e505d221140b3a2f87d3'
        },
        {
            random: '37812d234e6d0be659746a695c2cd424f190f63c6e87c8de9cd03f8cacdd5c0c',
            crypto_core_ed25519_from_uniform: '6707e1e38e6f1826a0d2117abbc5b662f04e82ac6c25c58bd6650893760c1670'
        },
        {
            random: '6ca9ccffaacb2e769f48ebd0447c51ab4bb51164bf94c03781fcaaf8e79bf9c0',
            crypto_core_ed25519_from_uniform: '1e225628ed90260e303a32f8439c584456f4c24f99eb86f00c1521b9f3788751'
        },
        {
            random: '9fb55ba1ecd8b55a6d41cfd56aca9622b30616dbb60a8e32beadb282ef982a0e',
            crypto_core_ed25519_from_uniform: '6c0a4fe2b9260bea6773652217ac97313c3d757f08cde0ec2769639e560acd3e'
        },
        {
            random: '036ebe58ec805f9de9afff2369fb4457c13a5b636608caf97b8ebafe5097c54e',
            crypto_core_ed25519_from_uniform: '962d96405fdf082c2423ded384cd6ea99011e39174cd642d3c1077fe7a4a1833'
        },
        {
            random: 'ff56507478f7175b1019d1242240f51b3ed14e498f5fca09a04444cdee35ac11',
            crypto_core_ed25519_from_uniform: 'f128cfaa03ee60eef6149c47198e95683b5689ee7a0fd0d19a6084e1e64222be'
        },
        {
            random: '327477a86073ff10576185ed0c04859c4f27abd0c509d2b96b7257c037dae49a',
            crypto_core_ed25519_from_uniform: 'e174bc4e0c84bad20f1b69c602ff2bb8ca3f244eb6088a4578e2720b72711967'
        },
        {
            random: '7880d58534d717867cd0bbb00831925d0d27a90b7158d6572c34b0b99aa44d3e',
            crypto_core_ed25519_from_uniform: 'e12399ff270f2b1d69b2957bdf9ab7a149a04def485e96e1bde887f181027547'
        },
        {
            random: '1e2e13213617fe97ea935d2341c7092a8693e08098b305c89b05696cb971213e',
            crypto_core_ed25519_from_uniform: 'b35a291acfe2f75d6495af2699ad7220642352ea06110411377268db6078a4d9'
        },
        {
            random: 'd402e7ea1e0f2d1b3ed4458a7046e70ae44f47e2469536e2cfdd79e58bdf04de',
            crypto_core_ed25519_from_uniform: 'b16b12e32671267bc8b1d7a23ddf53d32ed371f24326265838bd2ae57aa92f4b'
        },
        {
            random: '663fe9d6802d8bb89a54816da3cff1fece392254c0c8008ebc79811bf5dac750',
            crypto_core_ed25519_from_uniform: 'f4dc7952ce218dbde2132d296e9e5bdb9f6ba751ce6168eb4da3be0894bde51c'
        },
        {
            random: 'c4a504abb07e5f8b917c1bfe14fd7657bd62f34a6e163f97775757cde4dda553',
            crypto_core_ed25519_from_uniform: '900b3d5dfd581cca54c5ce900bdcdf6a633ccc91e8b39e99b3db344341ee94cd'
        },
        {
            random: 'fb245f14fa8137163f8334ca6df505cd12dc1b12c7435acb62dac34bc5aa01db',
            crypto_core_ed25519_from_uniform: '91f2c91d03476276b06b2d954c510eb0ebf60e593173e1d41ebaf4c4bfab2cec'
        },
        {
            random: '527d0c8468a6e167317c49d56c6f3a96f2e92d4d8c39855d2ea77820b34443bc',
            crypto_core_ed25519_from_uniform: 'fbc305301e2677557ed6d0849449b6eee08d0c24c80edd09e1a3ceb7ae30dc6a'
        },
        {
            random: '34cf10419ad1618a2a6d6bb82d5ad99b27dd7a213f4b7050893ac327473ae499',
            crypto_core_ed25519_from_uniform: '4ece5945e8044bd9f308c67beb9f771354068f048566db1f8d1c3ba4667c95bc'
        },
        {
            random: '0eb9c6d29b2e85a0b17d7b29bffe3745e56b905e021408497b837dc93922e7aa',
            crypto_core_ed25519_from_uniform: 'c56bbb48b8db7c30d11a6810978e6b0e30df73789c7b0520c2c918738bf8086d'
        },
        {
            random: 'a89e02a54cecca4c05203c970b22b851df4a84181de2b001167e4a008977d21d',
            crypto_core_ed25519_from_uniform: 'c97fabf38cbb2301b3c35d97b169711ef61eb7099828bb1afca309758dae42b6'
        },
        {
            random: 'ca5a3b30e3de631a5cd22917e2dd82964abaacfe6feca02f0d9361de46b7e6b8',
            crypto_core_ed25519_from_uniform: '0a9958a445343159921fa47ac55f1bec0b284ef3262190319700467cf71b1249'
        },
        {
            random: '086dc32d9173ef591abfe359015a4030112fdbfaadfa9c40efdc877221506a67',
            crypto_core_ed25519_from_uniform: 'a4ec0e68305dba406218f3a390db6a767fb396465dfa56c0191c843e3f45e9d8'
        },
        {
            random: 'fa672fda12e763a358e8cd0cc140e2a5f0614044b58f1e9d1ea4fd549b4ce4fc',
            crypto_core_ed25519_from_uniform: '8b2949ac1daa9254487feff29445cd306e04df6aea63ba5fab50ecce088c8db3'
        },
        {
            random: '56f511ffecdf55787f82ca70b5eb90495b38d16d8f0bed445f1110759d8b7634',
            crypto_core_ed25519_from_uniform: '4a6a2d0be266179999f54040f1a75a390c232dc82c9370686c4ff3ca68ff6ba8'
        },
        {
            random: 'b1c004274a012b9f4f3128764d8fb0e60a9554fd5eeef8cb960a4bab19558634',
            crypto_core_ed25519_from_uniform: '36f15b16b17f19a5f2acb2a1bfff00544e09c0a97fcbfd2a68a673a92137b804'
        },
        {
            random: 'ed06b6c5720ebb515db98e2a8e9fe279eb984a9c8f1c5ad201ca6ddba993c99c',
            crypto_core_ed25519_from_uniform: '3c76b7751924e575b13faba21f5d4a428b998f87f8fff5a88fd372e1b19eb22b'
        },
        {
            random: '974a1c48f9a258f67f1f4d6a2a02ef6533fb560e7c941a678930be559c894b68',
            crypto_core_ed25519_from_uniform: 'cbe5ecd8cb56d80dcebdb117979cd083fb7c6efdd9a01ce2cb99de6ba0a3a373'
        },
        {
            random: 'bc368741274c10e2436fdc18140a4390b94c0a337f4d74058e108760e5f9a8bd',
            crypto_core_ed25519_from_uniform: '80209d5f361dd693918122495057cef53515488f93adb9180a363d55eeefa7bf'
        },
        {
            random: '08f9194cd4cb4237ddb64d0911d64fa9921bd82dfdf44e0491b319bf3bc3ec2a',
            crypto_core_ed25519_from_uniform: '78b29d36e7929de9299df5ab953cc24cc8c4359a212964499d2f51cbca0017bf'
        },
        {
            random: 'd7a1d771436459712e94ca4c7c6dc1c7f53a4124052d9507588c094028895492',
            crypto_core_ed25519_from_uniform: 'b8b354775753af532c135e0609192b939d484bb923f80955dc4ad3e70562c892'
        },
        {
            random: '3c2cd33f37ba1ed32f6cc011aded4ea2df32b73184e340a25276c7022d96579d',
            crypto_core_ed25519_from_uniform: '526f4f6427b0a96de61aae3246d00412da98cd2cd59edbeea965d71491c6f0db'
        },
        {
            random: '1ab561511725aa9559ac3b18f8fb8d2d483b601dc00578c8e00771cb8600b718',
            crypto_core_ed25519_from_uniform: 'af2c98d3fa15413b7e00e20e59b3b6a24ea1fcb139aa632fb7d9243e6f856226'
        },
        {
            random: '909d1a3e87d9fb7f414738cc5d734197906eff64f2c89f86ec85250166652c75',
            crypto_core_ed25519_from_uniform: 'e622a76921ec9cfa6c5e518bc6635f2741e0c9de3890df778613ca55931764ef'
        },
        {
            random: '0115ebacd76aa0592b47074391d6382c3e109c607f9a2bf5f4928a8a108de0e8',
            crypto_core_ed25519_from_uniform: '0e9c5cf729387fde7744be150e0b167c31d5ceb4640193b7e6ef1b24915e5051'
        },
        {
            random: '93a983d7d54c02d1cd08bf46ebb184c6c5ba4cf6606db767fb6696ef66c1d121',
            crypto_core_ed25519_from_uniform: '9250aa1b5b392a515dd076e2a754290743e6b3dbbf48557b2277413c45e17e99'
        },
        {
            random: '18febb81781ccfe50ac5a77a3d438e1afbc8315fdfae56a26d4b688cda793149',
            crypto_core_ed25519_from_uniform: '9d9680a93d51a857a3e4ad398f21e0bd87d369d10b3c00c74f86948f9beff44d'
        },
        {
            random: '7b9afa6131bfb900730f695f59be541c87f8d61f3b836ccc7497876d916fe82f',
            crypto_core_ed25519_from_uniform: '54221d1b62b81666b8768c2e47c4cbd926b8bfaa9b42cf131aad26d9df761073'
        },
        {
            random: '010b246562a81f4bd2e0f2ccc10fa911adfb94bd802f7d7bd2988a91e03ab601',
            crypto_core_ed25519_from_uniform: '961fdcdcec2d66dbede3fa3062a84e490162cd48b3315440804b7f94dbecd4d5'
        }
    ];

    let sample_point_add_sub = [
        {
            p: '00611a85e5a2e76b9218d9c39e4a76428aa6b76a534ede3c383d2b76b96ffb90',
            q: '2dfc24c6e9cd1ca32e985aef9d22ec0d210c50f66c7125523f8425d5a66e78fd',
            add: 'c94541b929868d2482275797a775ed234bb6b663e68ef12668fa99483d671e41',
            sub: '7d5a80f588b930b626a48af04a8744d1546796be1073c858e0ab3477e8877bb9'
        },
        {
            p: '49d79aa40b22539ac0f61509fbb9c40ecbf00b9a4474cc283805b84ebaf46808',
            q: '4278974dd3d90d841dd1e5fa7305d3272a8e85292aecadc6bbfbdab69821fc5f',
            add: 'b15658b53e6047a8c6fd1333cc0449b5be816727d7efa7c2e4ccc518df22f6fd',
            sub: '80a9050e8947b93d2e3761f527a6bd861a6ef302ec65899534f920904ea68001'
        },
        {
            p: '2b79ff0e5c91582a7bcc68b93bc9ba0613fc45f41b55da0dba41ece712c85401',
            q: '831d5890595a93ecc6dc4647715bed7dbd478cd0e0cbe9b87b676b01c4f046aa',
            add: '94aaa3ac0023cb0056d3b236645130e345bc3992f440059c5bcd0bc587c3a88f',
            sub: '6b234302b9f05ebe637c3a759dbcbbef468013fe786dfaab01316e35b2f30d1b'
        },
        {
            p: '5796b24e837b5b5b13c6af8c8e03b0f43ac00811eb7ea28f74dd83953a5b44b3',
            q: '13d218644ddc6af27b38cdd505d56687792c773fe987722cd6504231465b51a4',
            add: 'd6cdc85e762a93890dece58e65badca1859437ce52365096ffe3005a37703665',
            sub: '58f65949252db0833b0af8e5686327bacbc449da655b5a312c365c1cf51fd699'
        },
        {
            p: '0da1b0165bbb05b542edd79ba34369225452b7d9c1447c27651dc5860b7bfa03',
            q: '7427ba3a806c0ab8ce68e7769e1e84e20d3617a931c72d297e226a91e8e37fca',
            add: 'e7cf519ea6969d3e64dd3b0535d6a84919f21820352e88ada1ecc8ac1954cd55',
            sub: '4dabad94a65fc6bfbfbadfc3ec30d0e2621a8db714d3e3e8f4bf8f841a0b3ed1'
        },
        {
            p: '37b3d98a4bef04c3d5dcba78fe36653e8e771f3be135d7aa4fffc41e67cec4f5',
            q: 'ec1cd66c11401ce1b6edb4d24c5fa379340aec490f39f9ed9d2ce9f47744b2ad',
            add: '2932b502a5c9247f2907945d5c64728ad81d5e15a7bda1978b8bc30a2afbc713',
            sub: 'fcf4da240b091b2d8f5e8b323e63cacecb40d71dfda1c65e22551f0a78b0ca9d'
        },
        {
            p: 'fab612d02e965deaa6615a0142d89dbab72e22481bf428034f20de3a9c72afb0',
            q: '2e6ac0e07c1f7dc84e8a15110366d110a6855c14590f00fb0e28f54eadfa6151',
            add: '1a7a26180c3fa22b9d875729791490799c9b0f4c4ede5050e0e97b1c97336144',
            sub: '0a3d0b522afe0fbb6649f516375c59d038b7841ec294ab86eb96002bfb5c161d'
        },
        {
            p: 'f0a3dcdb44bea23189d5a8b33150a6164db1c8175ff09d4242568c449c36b43d',
            q: 'abcceea853f7ec419128a40faf4ca2af0a23aaae7c961d327da89e81466b6b9b',
            add: '140e6baead21f0be13b012bebab2ab81f8310c28bb301f6d07d05cf85387dc35',
            sub: 'd05551b4d53fa77a4c30f89a0adff3354b2745933933a699892c36988b0206ec'
        },
        {
            p: 'e824bd2e58746bafa30db08b7a517786f547b73f3de172ed355fc0c3d17dacd6',
            q: '5bd0be7c71530134fd20a95d0ec2cbcfe6a56e36564f2842fd6823b46e37ddbc',
            add: '665c074a766b5e6aae6b718b45514e41122398a40dd1c084ca23193437319fbf',
            sub: '1667d9647e440f9127f28e05c4c0569ea19c8bb90929d006593a81920ca7a8c2'
        },
        {
            p: 'afbc26a1525dd7752334553e55afc34d08eec288bf509354923050d2d5c91854',
            q: 'dab6926a0586b9f5d1dfe2060c427fa664bb5a33b884049562abef9ceab0f2d6',
            add: '850bd47aedbbb4893e9f69424de4db55967b101421324eec3876d990cc1db6fa',
            sub: '8d34626d94a2068c2c74eb57d4377a2baf78f6e46a43d9184061b87d5781c05f'
        },
        {
            p: '176f929d4448c8b5fcf355d4abfa1c1983f45934a41b67d4e9a7284ca55ef9bc',
            q: '1399cfcda6e1d24fc0380239f9df5ee454e69522efec8f0aba0e582c69d9d091',
            add: 'ef1ecf4bc43cccde0f1c5f2d46d8eeed319f851594c99c593c9840338fcbecc2',
            sub: '9c6aaf174013b119051abf426fc71cb995a17706664b50deff0afe5f1985f1b7'
        },
        {
            p: 'ed2d32d97c83ef3d87b5859e9d708d3c608ef47e179c3cc4b8729bd56bc291ae',
            q: '53a12626da3cbd01575dbf31d3bd9a4bba544ee46fd0468c61b74e83c769ab50',
            add: 'cef4d7ee11eeb637a9f626a2cf9887acd1670b87e64a4dcc54ff9898a5967ef4',
            sub: 'e870d86422057fd51775aa3fe44a6946c5edf124bfd12d384df5c234a3825773'
        },
        {
            p: 'e4f875b7a16f22751716fb638a930db5c0e3c2d7dbbfa683c07aa03700ccf0c2',
            q: 'cdf938008a976214cc7662379265e550f1f254078109c4a8c9e22d6e1389132a',
            add: 'efc4e5f2efa6cb67edb4878a7e535b0269504e049cd5840f2242dacd03a92873',
            sub: '76ddca74e2573f73ec25cf7d07250a25f3049d228c0e128264df5ba077990164'
        },
        {
            p: 'c8089df65181015fd74304a14392d7a3b17f24786a1624679841aa732180d707',
            q: 'c408fe113e89fef23e49ad42b39f266a079577a31a633aba5e6c57de0a675176',
            add: '113af112ba09953bec0d5f2e50593c8a3aa18b63b29c8044f73bdcd15a69ad35',
            sub: '61847e37813de63d36126208e5a0c733cb07f5253947bce5f6a268de86307e89'
        },
        {
            p: '4c7f8b6c193a4fa4dee5f00132d2d48813a28726cff79124d256980b1b90f700',
            q: '9308a463b65fd2d6bf7fbdfb1eef39c73abdc7ab17457f890152a9ad39b16772',
            add: '3f2a08354747b1e7a4255a2d2ed1c73b4930ac909ac7ed42b67c4ee7a93f21a6',
            sub: '068f391346496ee34f832ab95201d79f159185a0da8546436ada0877632bcb6a'
        },
        {
            p: '72225fc549143b9a7cf9a6070edbd4133fdcfbc8becc4b8070ef5781904fb3b1',
            q: '4b6198253de261401504138fbb643e22ada4ac0f5515109d7e98d1a0442b6663',
            add: '06a8e06bf0f5c05a7bc0e823bf091b8de4ab3b9a5fa20282ef6fd5bdaaa5ba84',
            sub: 'b76a896234c9033c84c7b4f52c9b51914898cfa31cd457a8fb050ae8e6b430d3'
        },
        {
            p: 'cc97c4cacff122948c78f1905f4f3de464ba344974fd461544cfa2f1ee652600',
            q: 'f2406fb90e27d2921d80217051dd2916f0d9700d9f0ecd57b6404b6220cc7d40',
            add: '5f18b261e778d964c58df63bd4562f139e62eaa3ec2af5842d5b37075e3c2add',
            sub: '4ea865f775b78810b06e912c8876453efae8f5cf72262e014ae9c8850b28e776'
        },
        {
            p: '61447eb63ae977446c5846ba4e02657f0f7d617b0ed4333461dd53f228618246',
            q: '97880e21b96a341df5caba858a36dfe455732cf71588abe642064ed35655b5c7',
            add: '8908aa590852de5777c2ee9a70f5c265375a1de345d7a2dffc8a428efa23dcd4',
            sub: '212f273f9f1a4dc0fbcecfaecca67919644445436ad12326f3d63d962ac606a4'
        },
        {
            p: 'de4972615b7e34bafb26c68a6e74d1795377b7c810dda33fb9314075ffc80995',
            q: 'e9fbc69841172086fbeff30c5e4945333343c05e01914cc6ee65541503d95557',
            add: '7f287d505cf8e5e027bdda7ee07123b9209c0be0ade4f7e911ad6a82fee8cb21',
            sub: '4a4861678587cc9aaa982d7d0428512e211539b1f3603848833734ac224f916b'
        },
        {
            p: 'a1593473d1e1da9a24e11ee8054f30ed617ec7f2d8b824b7eafa191aa33db354',
            q: 'e524151fa78b6c669b2dde9a721a3c35f93d1042c0a2cf6126ddb09c134ccd79',
            add: '91ade4d666b8d355f3a3f4c54611e9f0599269bedef5f8c8b545a594a52e91ea',
            sub: '414cb593a4ca8f0320a94afac8aeb161092dd0fccf40d02cb3f709f284681d3c'
        },
        {
            p: '5a3d6eb3643d1b9d1270ae060265d90f1646f045154f91c1d37a1229615d8f24',
            q: '610748f5160c79cb7b00a06405374bee42d32ce11cf3338b6a557fd41acdfbdc',
            add: '23f466110cefe634866bdd88637fa116f24335616fc580c6d1e2b5ef2d6d6c77',
            sub: '3f64a61fea5b1d58a0e137af53c27aa006848815cb8610f3ad8717f3ad0f271a'
        },
        {
            p: '1149ed0b86eef79e7617aa1a0bbda38f40f2d80e116d48b10c27f1d65c98e859',
            q: 'bb95697e830403542fa0fc1bd1aa2af3a3695d57aae86170f51d4988f3370941',
            add: 'fb8c43ffca7433f5ca949759fc8d8a07678da885d5938e82a4e189ae5d4ffc25',
            sub: 'c480f84900674b4fdf8655dcbaf47c6e995eb71aead10ee9e5a1c0a2c3043a54'
        },
        {
            p: '2735b98144532110992512016221862ddd5d3fe4a31aab273d9a113a249f4d20',
            q: '198c4af5f429a9d376a058b20b4ade5559501d0d90b9b4e7571d45f5e9767b95',
            add: '255677c99f048f48e2a135d3518948998dd6d2b36875efe56c0447f2d5732349',
            sub: 'a56718972e3a6906fe6b3fb48074b8fd21a2a75f6baf04a095caecb8d76af4d1'
        },
        {
            p: '6377063a94adbd07c81b9d4ef6f6c58091dd0e77c8dd37ed2331cbd949c6a543',
            q: 'bad55631c0e95bf9dbced90623ce84af5a6e351794a4c976b8febc8a95d781d1',
            add: 'a6c81d73bc3146e7227ea6e6eb2fab6babd1aff64694285eb437c92013f7be62',
            sub: '316714653aea6e9068d35239b81f85371e1d74c03446013320cb6f096d551f90'
        },
        {
            p: '123dcf7895d6177ad2e11c5be8f286d22b0eb1cf260753ef3629862f562e74ac',
            q: 'eefde26a180401ad9adf35a3725a371e10d8458535cdc13663063f16959452e6',
            add: '723087e491aa502ea9276d08352f3c3398330aff845ed43a2d8d1861525739ef',
            sub: '09e530775aa6aadd15c9451ee5c95ad6a2cda20673c73e508797d526edb4cbd3'
        },
        {
            p: '8f47d7f45830b6c11e783d16088feb74567e760ae48900e710b3a39b49f1bdd3',
            q: '3dac72fb6d2f8f4d8f09730566876b6bf081af245f8a29dddea2398bc4601388',
            add: '95202061db789b48f2aa80f5c96827fbb872acab6d94d14928f6b462208395dd',
            sub: 'd80ec47023f095371420bcffa098e4e1117e550e8df20a3d84bfdeca013de93e'
        },
        {
            p: '255d6796e43623f13c7004d13370fd0b9645d206c40d6629437b61b827d4af9f',
            q: 'a90c4be6348d822bdafe2ac7073e7fa55443e4d482992b73308dbb3d439930a9',
            add: '13918deb6b4bfd2a000be5e2a742f457f872c3b8556385d52a9bb78b2fc0af24',
            sub: '8a285ab6f6802a3ce86131a1a43ba41b55ab2960b9c6c807a73fddd16db4960d'
        },
        {
            p: '19d473f6a05b9bd2796d1cf2f7dad9e9d43c1284a34016142d4c085103372103',
            q: '186c76321a4ca4833bbf70e13769a05bd81811d078a403e2b3f60fb80994b9c8',
            add: '006693e6f89d1bf40b28d4a20e5bdae2897b7e7476781c4e9e13cec387f337f1',
            sub: '5e5f1cc9be04581e0c65fbacc72acbdb1636feb2ce158ae97eabbc5b85f0bcf6'
        },
        {
            p: '0610e6ef3d56d58c49031b6c77526b29c446d66a7a19385b57afcbbd3e11ecb4',
            q: 'cb4d9a884fc2477f4bf4446ee6e61743d9728114c2440ea3ad9b77e24ba2d17b',
            add: '0611d39e56124823adca93d1571145ff3253e48e97b4c3c7377bca693c3e2cff',
            sub: '6acaf8408236d5da0ac20e167b56c16d8a0100505e0d6994dde0d28100a8b272'
        },
        {
            p: '395d8c974ec4eed32a14b9e7e4fdc8e5bc0f3d39f7ec491ae7bc0b7027734990',
            q: '183912aaa59eb04bed7f3c57def952018a7ee796fa5624576cdd8a93854e6c66',
            add: 'ecd6332966f576a9a9629fb71f369650a282620442a4b898aeb5171f7b130545',
            sub: 'f056c988f4364ccedcd6465fa0fe087687b8fb382814dec6b3e3d56bee73cf2f'
        },
        {
            p: '2b50963412105f6df3bf3310832f3b55b114476a21340c6a884dbf89c4fcee2c',
            q: 'f94bbb12d101496383abbd911cfc86482dcc0578d2500ca1585d2a5cb0c14bf9',
            add: 'a895e7c9a93dccc831bc0ded11143985dff1dcc3a0ae1e64c7be5f98d45dd919',
            sub: '2b6edaf8c29a1f3d42e113c8227a403d5d9843c13dc93d858c8ef7871551c2ea'
        },
        {
            p: '4ebc279f4789d872bc8adff79cd6f8097f41fadf58883b797c6fb4acc7506c93',
            q: 'dea099a079b6fba55106e7166d62cfc6f4ee48588863647075e0a137be7b281c',
            add: 'b74321c2deaf158b45115fadb4c499a0a81ae90c784860a73538dceb6c899871',
            sub: '6d9728d71f4248a72502d75bbb46c35c31a70042226e405c2eff355ecc50d832'
        },
        {
            p: '4582bd27a90da44122d4eaba5eddc70bd3505c07f766676c1a2aa83d160b34d3',
            q: 'ad722e1d85c8fcb90e2c80c64c436bdaafa92f2077ab5f1796d2d38721947ff4',
            add: '55f918ede43755957dc599fd656e36f0822d9885252561ade8a864e95afeaffd',
            sub: '94c4f99483d80253f91cf0f5436e826e09c43653a1ad449e49e6efaa6bbf88b0'
        },
        {
            p: '16fe162935e53ca507098fb92e56a28d64fc949a5c5190b34e6df9fa81755c6d',
            q: '5c385d68b0df33f75c7877bdfdf1c9fd9373db68b456f9543fe2f21ab43112d1',
            add: 'ab15005fcf96d1effed54bb57c19a795be58531429ee51e0412c9a7ef4b3093a',
            sub: 'a9a5fa2ac86b19093ecd667dc354add586a531c4a5f036a3d76e6ca54abfb130'
        },
        {
            p: '2064341e046785c4a2e4e04e43dea9371874a2c161bbb2c4c22f5d23553ce4fa',
            q: 'e7a503d669809b1c124ef5329b1fd8ad475ebb386964a7129019c2feb671cf52',
            add: 'dcdc9f3833ac5609688ee785dea0b7d99ef98d44a3b534216e042e807c497d3d',
            sub: '18572caadf3440f38b4eb3ef41f73c07ad9e811b865ece9e69e7073966dc67ba'
        },
        {
            p: '219de4882836489e38882688a338703fa6ea8ea406215a90e59f5c795823d75b',
            q: 'f46158f2ba3481f593b3c8194eed732694c41797239d8321286577b945a9daec',
            add: '0b15f22b2ccbdfdd62a0a15937f618c85bd97b7a5f3c070a89de928e2d6fd202',
            sub: 'fe84cf61aa915b038a1dc3bc8e6f65a2d454bb5e3ae04b5a2d8678d5a3d0628b'
        },
        {
            p: '65788b25be62944c5f6819655600968ef0ad83af48e228ddfe8f19df32c6300d',
            q: 'be7b398f123c002f773f6da62a318c21422c411dfaa4cb54bc4eb62e856f7a3c',
            add: '6c766daaf1c9c63d45e185c418f3f0940e3d1dceb8c4d3e08f1458b19b6f6eae',
            sub: 'd91366625ac2901329f9698a7399df37990c13146214f80f2e448584450a4c43'
        },
        {
            p: '25053dee92c9aeef4eac1a48b8c94141b6a6cacb9c09eb2ed1bef737f7f7987f',
            q: '72a021758527956e7b9d464548998af0887c026a9680cf2c03569559f40ec5ce',
            add: 'd2ae9b328cefd856dd5ca26ff24530c4b2d193c5fd89a06b9d649b10e3865d3b',
            sub: 'cbedc3335e61062a19e37b0cb95cb154480faccb8faaff0951e6e8a8b3244c8a'
        },
        {
            p: '252c8f1de5d0b51b50b7214315a0cedda0f3819c8b4292b785e370ec218f2f67',
            q: 'f905cf20c76fb58de7e5a6293d816b67aed472cb56e47f7c7d83aa95fc3e5cab',
            add: 'a7392acab8a269ec48e140eddfa74cea6e3ace7fa07427c06a67fd9b43130d8d',
            sub: 'd63cb20c14908120e37bee8946edd476effa7bec38b6a63620f0a2a75baa2d1d'
        },
        {
            p: '46032c8e0189820aba5d6e2669b59426df1e8359c6ddf37ab2d11b87dc025df6',
            q: '151f2263b4960c43b9ed854c2f62731f02b766733a21ce2b73c389cb47e595fe',
            add: '369b10493ba0012b4d47ecf5c8af91d02f9c87b6ba618dadbb67fc68886fd925',
            sub: 'fde511ea0477c30ec92cce084050794b7d701379c6800802045e8b84822e42e0'
        },
        {
            p: 'c0f30f333fb19c72924390d223d83dad30c1e4e14089ed8813356565b6648749',
            q: 'cd85d8b217f5c72861fb633301eed8613bdf7e101c8028d6addece562d5b2e33',
            add: '8833fa3f34191edcf21c658ab745f61252b56ded733f24a3cc10805b6a0faf2f',
            sub: '4b026f377610c677483401b4376b1e65dea6b804359015eaa6fb39261539a84e'
        },
        {
            p: '2784c8d2ddcb7ba8f0f7fe85b600671199f6ce25d76fb605d7214b6ad1c0fa4d',
            q: '0b7fcde97cdbbf24cefc738514bba015b66ca765f8c4b200098eae649d89c1e9',
            add: 'c95b2e5c832d16d1eec8ff8905e0d39e7cc2f8cbbd8fd107ae41cbcc8bf18ca2',
            sub: 'e98738b95efe8b497604c65f23943ec6c551a45b232e900efe2307df362159c7'
        },
        {
            p: '33250897e5c8ad4142d5546214a626db0308cbeb9cbde62e9f731ec7dc2cd37c',
            q: '046ad19c946c64315516d9bfdeb7ff02c9c30ad82c90915bb3c99f4658327cbb',
            add: 'd066875b87d6bd9116d11aaf8204daf9ad342977a6ccef601116b2ceeef0f6f1',
            sub: '4aaa441b3f25b9c75d4d3a65054d374e84021c58382d1a769ffad908e41a329a'
        },
        {
            p: 'b533b02f2e35960150d98ff6d2596ab85c35d7c2540bc723c043533e50001362',
            q: 'a8a9dc2962ef34c0d029998d0c87141b65f2e47e27ef9a24a1bc2afc6b366707',
            add: '89e2f3c07845ef18cc96c78ff72f0e797fa9a68de9adef0e1755405bf4854c79',
            sub: '705c4fab3e3a67fd564c66baa7d16b50d0b38ba443b3982b2f6b363b64b15e15'
        },
        {
            p: '15811fd141658bd5e55c851d5f96858416a9e4667096ba965c652628946fea52',
            q: '1af3a1662e428673376631270588572fa5823ca29edf1446af32c7b0931d924c',
            add: '2fa857907d6b28a8641b82cc9d2eac77104b24f50e8ede8b1a9b4a246999cac4',
            sub: 'dc08413fdf6df35c3d7be9884355cbe5891476e7f35449e7b841586aa26209d3'
        },
        {
            p: 'd7757be0b4ffa41aa4b7f79d56f20e1c41ed4e9abd26de7234419b311f0a2cc9',
            q: '4aca0bce7d1e6985cf3f2fee6186bdef0df3fb10bb204ae7aab5ff68e4f22da4',
            add: '050f6ac4d2c1ffdf7416f24c9bfd16cc95453ba5dc6baba0976a305edc32e719',
            sub: 'f1976436fb124a684384260df1670ba8c5bb8a949675d0de8ba4ecd2dcd857bd'
        },
        {
            p: 'b9c78f291cd9fc0dd2bee235e6386df6fdc7e5248fb7f06959289e9ea59d4db9',
            q: 'a890f19b701cafcac5f65eaa368dabffd3657a403f6d3ceac25b1bb1dfe4b1d9',
            add: 'a7e7d8b784c0c8f7f3218ab8bdb6ab84d588bdaf5ba0fae7cfbfa14a9e051187',
            sub: 'e5cc68aa2c21f49be500603ceeb41a59e0ded8fe33d55d9194d324bde8d95f80'
        },
        {
            p: 'a7ef39f7004b1e912c8ef3841628477750cb2fb4ed5f54ce130a29583da2088e',
            q: '7eacf5cd6ddbe7079de72354bbcf740d6b0e624549783b45d281216cc1eb9853',
            add: 'afa3570b017a6a45859f7e4622491ea4cdf6173f3e0f584102fb582fae271f18',
            sub: '4e9cf2b4558395b8b6aa97f6b90134ad70d8f962bf20e33929a68976bc7fc783'
        },
        {
            p: '7180c13d98860af43b2b81e20cf0ddc8700f8c5c3a1ddd86f071998a285838c4',
            q: '47e4a28543c7325520abdacac54a81a3e5a9a885ee85ee53a9129aac5f16b354',
            add: '78e9b7e796e9cc7103fb6fc91dc8c15185cafde522f2d4aa394d97d68a1bd89b',
            sub: '3ab087870e6c4c3ab3519662c6d8db57d1061996620ab20a1df1ef5aef8c915a'
        },
        {
            p: '79b117914508f156033bf821643b4a1b224eb859883a6badb08ea088d72d0af8',
            q: '4fc5ef826d195a5d4fd9a36250fc8a421e8f0f14463753e586cdbeeb48da611b',
            add: 'c7aee3526a8359a0bb7b94ae207bdb1c1eebb166f66901c8834f4ebb73026cda',
            sub: '0df6e1545ec3713181d778c2c3be0cc8a0401bd362fee4dacc464341ab900cb2'
        }
    ];

    let sample_for_crypto_core_ed25519_scalar_reduce = [
        {
            hash: '815a8bdbe31cb02d3be20f566b57ec3bf6032a2fd138c1736821796e44af0a4d10e56b2b0a43c81ccab2f5db5488208c8f0e6c55498d24dd3a6c874a87be9b41',
            result: '5e79be4ef064242610a59f88f742e71810c13e9f4090d9e2e54c12e44406830c'
        },
        {
            hash: 'a05bf2c6cb55c1350cac047e07e2965662bb9ef4da5df57da0cd134c2e1b7083eaf31ec23d1130f64294d00b8e92cbd047f10e34c4dcb4bbc28c94e7d2f5f9f3',
            result: '56c7efe68251941e30c40712a809d1176712ba9ad45b469e1f3ff340baf52f02'
        },
        {
            hash: '86d79da0ec6c9e489466d26a0910fcb21d4615c55797b4b0e18de93b7360d5280e9471c9950aebe3527c33b2603acedae0d02ebd2d7f8ae708071b40aa4a213a',
            result: 'ce26871c8d391af5fb06f9b0c6cea9d4d538856326ea81f2b7eed7e3bb21e50b'
        },
        {
            hash: '9204a078223876813ebcb002d0daa8a80a4c1edb865fbee1739afa8b4d02e663acdbb155906c2f39b001ad3c0c96e745ff49f3cd05b447c52bae8cf9c2a06031',
            result: '7774810697f1659f4d4d0547b2d43aa59621c0d63c8426c9d1d880e74514ec05'
        },
        {
            hash: 'd283aa7d8f116966ac369fe13fe677966ce781c57aec27ae0c03686c812ec9aa203e94566511c1b9b0e9e5c730bdf7c8cffb48d29aa84ed5fa56303816d2703b',
            result: 'd6537f67b74800c0df166654fc71d3974ee4dc9a4569f03e66e8ca1d95c1f805'
        },
        {
            hash: '0ffa9047a43fe04b2fefb2053176f8f3b38c075acf4c966d25b21cf7f5d7d8b1db356aae3859a04c411a33b876df2b32f9e306e5d35a66bf2c7690e9c8430efc',
            result: '59f213c6c9b88f8c0f902e254c72b9e3c3fb9c7b82973462e831f74531b6b904'
        },
        {
            hash: '2a2431438cf2e4a9bf9c7a8e82e5a45d4096272a7ecba4f053e0d17dbf3d417179979b2e05250a28c575a934cbc80cd206e2a34884990311a838f3b914b62f5c',
            result: '37610659186160a4ca4772fa31a6f9dce1dd5bd8186ff17d4de5945e17dc0104'
        },
        {
            hash: '2f7adb6da26c7c733c63a838bc67c0c98eecca8dbb68707db1f4d9290aa7da499c4c5088df258a86a366caad89368df756ab5fc5ad18af65362924b67e744af8',
            result: '04bf80bb300f70135270518a7085e9960f9fa665b319704c0414285bc843dd09'
        },
        {
            hash: '3e2c6fa72e911ef0ac609fc9fd6e5d5e5150c233ed65ea1f2ba510fe2871b8041f2b59ef014ed6908de3754d84c9b2ca6eabe99eba1259fbc1692fb46d9d856d',
            result: 'b6f711a551f3d022c2891c26d094dbac1b61197fe9d6f62c0b830bcfa3fe3c03'
        },
        {
            hash: 'efef80b8448a379e2a7f56e8a5784da9b1a00b9801739089f085bce7b82f66c0354b6c1c2b5aaebaf54611ca90a58f9aaf4ed8363ef96787ff24e8fbab6660fa',
            result: 'adc61838a97ec02010d1a7f05244bf20c9ad84f3e09d0f5b300431d1e9c62504'
        },
        {
            hash: 'ee4d938bad4ca92b4d6c632ebc62ffdac7f8bc1435ced3fca88deb279dd3d565d64b5a08eb7348e6d8611ce75cfafcbb808709c180c89ae71dae7f63534bdad4',
            result: 'afdde37ac9d554b45e7f75629fb9beae4c3c2679747866e0e18ce55e007e710e'
        },
        {
            hash: 'ce1ece525b55441d63d4458e11fe67dee88961d631df5631f59b1119f971580f7adf2d6813cd5e28123973b52b7f69c3915dfedab5879d6f00332d2fbba98047',
            result: 'f95dd4093af96f2bf24aa19e579b97027761182af9ca4c8725cdcdf05d15de00'
        },
        {
            hash: '413f32c5b3d5dd47b5c8868c03bde1213188ca19c639d6968bf0b0a6470a6728e7e96a258c9867110d0c1f78e0abdbe63f3dd3d17990e082036daf6d47639e4d',
            result: '8624f185949c093fbf20518c1738fa78af2e1f63be0f1cd9bdfb16e2a081b300'
        },
        {
            hash: '4b1e72c3b869ab5b3ba0e0251158b58399b33f9f88e4e3893496c95a763baf34dd675060c2e68fdfbb80e5395c05743d67b7806cdf4729582a4da2fcdb194afa',
            result: '4105e5381992baf553c6279c98f851cdddf0410171166dcd70846fa9a984fe02'
        },
        {
            hash: 'aaf2fdb56206b9126413c9a0f4c48c685ac2407667f4c7e997e2729b8f9c524f1701b99e51eb60fa335c33b819a817f5d2e7df72db8532b50695cad5c0d514da',
            result: '93ee2e88626bca0f94d3ac08913290f73fc50bffdaaf37830c90efa25537d905'
        },
        {
            hash: '0550b283a530dde6e66e3709f5bc134c1d166ff1571ee3643396f30a2ba90742fa5d396b08f2e6b7757fe5279e937bcf2f7df4dc52dc6d2be5f1ed2d32d5e47f',
            result: '498ab089a56eb263132f57dcb8f36d1425b65b2122f149ab290ff511f037df08'
        },
        {
            hash: '3524d8ad30f71f53bda517e397d0495e3fdea17e8c58eaf90ab4320d43b1928cb0cc6aa8ace577eb8c3155c8f83370a3ac16ac211964a6e423708b6048e904db',
            result: 'bdd0f6b19635b2ba22d2bef25b0cf27bad1890d75fdf8af198db15aaf70fad03'
        },
        {
            hash: '3ef4278c1d2682e31ddd7ee46e79adff29bd156188ba6e0100ffcf63a4ee0a596d5623aa56b61152dee2e7e9a589dc5c98c9ea40e881a7beaf2e2e78e3b2976b',
            result: '71d8a83a0d5a7ebe2e3cd7ade0bd6e1083aef6ff7bc0fd2c41fd726455eec502'
        },
        {
            hash: '2b4082a493038750974c15b417b630ccf8680a5ef4cfb3328ae21170b04aa2a4fd156102d0c23fa29474f6e8c8e391107edf9ed0563ddda4bd5379a52478d880',
            result: 'aa96b10c22b5d8c2fa2aeba1586bb30c724ca307056be796880fa7537afb0d07'
        },
        {
            hash: '04e4daef3608d7b5fdac3431f2beea2c6d42c8ca459bd815bf4b3b895b6af009a9760d3eb93119031011cf0830e5f07824c761fcddc558f9c8d674e472c7b828',
            result: 'cf852a7f79f7e83fb18af785de680f13b6c70e5b626dc5634ad1a3701f0dd306'
        },
        {
            hash: '88b097f774fcc985bf0d285387030158757bb7640ffb436f99f95bb34e376cf31494027713196aa2a32eeec4b1f17912eb1eaf51c15f90f9bde601c418ab095c',
            result: '98a2438d5b9a5d74db6a576a87fc7cf8fe88e8316301ea1302aeaf51e6765d0d'
        },
        {
            hash: 'fc6c8b7aae8fdacae64ad6f8bdb78a735274f08b0038832790278fcdba4ccad69cbe87bc08762241c78421b4c367def4988bd228081d578886e80fb2288c3cd0',
            result: '6615cf89625c5fd037e90dd778db97a5d34428a057fab6c54de88a43088d6d0d'
        },
        {
            hash: 'cfc762033b5a956bc19f100273577bc0751c7bded9fc31bca810bb854ad4f77499df3da4f3d0b7c6eece9d66117072c85c223f07515e213b4f60ba561ee87bad',
            result: 'd119d9db50cf3d18d4cdd71742bc03cbadebf338d43d66449ad8aa8b82d38a00'
        },
        {
            hash: '7d68eea2418787a18788b31d3602595f05d199c510f6e1b2a41776b7f3a85cb0a56df60545180ed5072ff99bf261619b4a68b2bfb9777cc599cc6c0251ade2fe',
            result: '0c8e3fc424b109fd0fecd0659e0969a77543d4e58fe6481c2b3b972497a01f0a'
        },
        {
            hash: 'c59090801daf9adfe22ab45c41038f0073af92e31ac546b7cfb04e7058f0dd0333df3d99167b0d0a1f63e2794f496897b66e21f73f41e7bf2938de5e019fc51f',
            result: '0cb6dfd68a0dedfb839fa4c403f7797cf324ac2f1e7f2c8d55f4eb27e7c8cd0f'
        },
        {
            hash: 'e7c9c6cfe6bed8a47fd3a50e426b0b0fc905d9937a8f7ccfd46930c75352bea6435a311a31362ab992b8164f291418d20f4b2a70ab5b0ad4093026b486f6bbea',
            result: '0abaf00a0f4d420fbc435ff844322e8be26e7ca092d44c3be4f18f679470250c'
        },
        {
            hash: '2f977499feb16f0acca567bb9cdc25c35b1ba3a47e899623fc21a28c75affd67bbc3c55c221826987b0d6b442ee0fd31a392fc395a36369d43388cca8aad0539',
            result: 'b8eccf352d623d1d84ea467b787de62854288059001480425828c38316876209'
        },
        {
            hash: 'd0f916952d59c623d9eb3b8b480f9f4b39e795cd9dceda2aab3ed85a4320fa7f9d20874fc3d667074d1e3a482558515b2c6990eb542ef64c052c28b7605afd7d',
            result: '67d86823290418ded2d1720a8ec5456f18ee1025ff1e72b6f83242c546c62f0e'
        },
        {
            hash: '9e9c03aa9d5332edb4df35c22e8f9d24c69fd96af0e22eeaa20c486e6f04e1161a513c03305b2ca616f495ac1f68c466329ae095dba02986426ff412affc3d62',
            result: '2c4f201307ee69ac5ad656119baaa3b820fe0fc433f342d4d8d94e866aec1703'
        },
        {
            hash: '6594523ecbd687fdf53fcb987f790d8e9714edadecb3598d5b5bf9364fc09691d368ad71f46134be9c493908a7d2bc838a3ebe208e9f5a9b0de872bab3643214',
            result: '1b541580b39726f6c50cb5763b3cf1c77bfc6c4890b29bfec38100f45bb1250c'
        },
        {
            hash: 'a90cc1c185b9f550f2699d611bd8039fc507dec06f7aa08f5664af9b4c2ff3ce978575ace960c785bbafc669a5542cb043b868c930d92d7d8650961401e77e1d',
            result: '87d4c5408a19fe67239442637513961d6ef2b0f61405dc751ff56e3a6eea9302'
        },
        {
            hash: '0b159a8176fa01fda0f0ec5f2b59bc37389180955aa5badb833c5cb415b748030dde00554c615ce00df6790859f46cca91d995a05cb34854f968c14a0eeba903',
            result: 'c2c60d1acea4bbda4b9287d9289a8ad438ccfacbdb736600a97124693cc64206'
        },
        {
            hash: '8b5d56a4abbda8e0287b9e1f304ef7a2c4f2236878e607c642441ea46b821c45794de1db8692f3f86070085c4c76e7a63c47491a6472416ca53adc4e1d0eee20',
            result: 'd79e8f0e393e02a5e6e527175804c11e4c4b5dc60a30fb3ebd82f584fd8ba706'
        },
        {
            hash: '0df168f5bd33904cff5beabe8a90365cb6bdf37e3e2ea5d8f87429624f83326d6dc96f732d46c9ab5b97ae7812bdcb7ec096550fd15aa520532818e6f66739e6',
            result: '152f4324e20bbadf4ba3aa05b8928137de10d8477e1156afa7e4f89539f95d0b'
        },
        {
            hash: '362d6adfc525a3f4a3430c43e97327e9ba6a790edd41a56f4a5469e2789d9ad1dd86ce4036013f8f2fd587526a78e267e853144c6edbb27629627367dfb0048b',
            result: '5d72223c2b341a904d936c75767601b1c85a8d1efb7f38f771bd660e17c60b0b'
        },
        {
            hash: '5d05f9cc773f2cd111a9352c00d645a359ea2c770fb03a8bd75e9922f1edf2cf1e2dd6020c4408ef9cb30f845c1c49135861c3583beab8d83ef0d97af3e9f597',
            result: '30566d2819b261c62e14884b7997b0b3c6faff612ca53889f418750c6bc5cd0c'
        },
        {
            hash: '7f49b4c139830ce33677ad07b0510d97dc47e06fa559967716adb8e8c9d9d95d9fb420ef0d9d60c6ada5e473430a3ef3e0f3918cfe40e649c38fffb2167fb150',
            result: '773982ac626976a61292a6cacc1a0e5ae5651bd0304dd8f9a9225e77b3e94f02'
        },
        {
            hash: 'dc7e508f2d172d55dbff9364626846b15668cfcb0bb3e7a08bba6b580aa2b607edd1a2a6f0be28f3addc56bae2303e4a802d9afd387c3299d75a3df996a9117b',
            result: 'e75315f84fece59faf1f46617b21c4af60f6f298b6e273682165c188ae831e0d'
        },
        {
            hash: '98ed4da5790bcad9081289315a40610a9f765c9d4a8942861adeb2f9315dead03f19a3e37c3dea9eb9a78cb727320f60fd7d1fdde3e2e4a0ab0a4a5812b03894',
            result: '31503a4c4d2205aacce5b178b462ff4c5d64cbfe27ee30880aa5af367ebf3407'
        },
        {
            hash: 'fb2484addf1eb8cb94b13f7dce8b36586b021ac21bd58caaf62f22b35350dd3e9b1c210359c8290fdd62b492f02231039949575c83652dcc114bd1f308eeee92',
            result: 'c760ec5c2251f56695729865cb774a9f05ddba7eeae5c7b4c6eb22cdc8febc00'
        },
        {
            hash: 'be954493dedcd2efcfc11ca49901983f8d691539410b866c9ad881fce1a74811bc3d353240cdc32d4cdb858ee35988128f8c0712e5c6d02da36e90456af0f57d',
            result: '8559a8bea15b5f607827aa0f028cf5d82390a40bc05bf37efc1df6ca96952005'
        },
        {
            hash: 'de132c452cb48a250bccb727d81f7959c1998de81e17894b8d4678604b94a32177fd3a603938d85b3fcf1b994de2c114a6cde1a93dee1dfe406aeab2654a159c',
            result: 'eac4b93fb34973002356dee4a3ca02ae1f590cc38db729b471197ff04d50ac08'
        },
        {
            hash: 'a47d20831b12ef47d61d35efb2ccd9c1994a69b9a83701a4d6275a53ba05347d9108178e95d3dc412a63c0075ec5f64a3e1d1c4472b8383edcbb4c9ba75e6402',
            result: 'c5c675ab3f47d4a30c3b6912c2226bef13813c84e47472d9fcc5b0570e72fb0b'
        },
        {
            hash: '9da7ca098984c649ab6e832ba2f06ec5a687f610efafcb4f25b2c5614dde5179d99353646813007033cdb99a5caf80ae1b825ec26b378a8f5fae901b4588aa1d',
            result: 'eada15320be145a0ea475a468596aea4a166c471557c96aec6ca34a423b8280e'
        },
        {
            hash: '53ef295ba820f8bd78ab976f957e855731901be8bed9739fdb91aa3e325ead343017b394f8c5181a295e019502c9501f64fa88fff1c77fb4e6143ef0d6b677d8',
            result: 'c516cf2ea46c25acddb8a9198e13a105fb35f4a2ea69ae82c2e1da2acf471b0a'
        },
        {
            hash: 'aa9fb0fe0cd14ee9a5be72857708a06f5ac06a32b2c5058827bf9f0213466649dd79f559024d13675b139db5438af0da15e5d9a27526ec8a67fe6875d9fac934',
            result: 'c8fb61bd0aea0ea208f458bdcd34d3b82bbce5d0fec5b03e9211afde31335c0d'
        },
        {
            hash: 'e234219a21bc9986d934ad67aca14f42b4ffb302471af93ee9c4d66052acca8ad57ec091062b432dfb0e26ee3332027ac8aeed7499f11addc0b5c8f373b9b07e',
            result: '92eee1338bb852fb5c67fc9125525ed770e8b085fc95e35a80515d07c0260009'
        },
        {
            hash: '38eb77f7f4e114c746b335223e333b81d29e640a7b293d5e880f11158144889f3c6eb51899dcd722191ac34a5b928393b0c6d2fb73ca0610af6d86923e75ec1b',
            result: '530a0a98b2e246eca89692f14cae901b66e383a4f0616d961c05cefec52f840f'
        },
        {
            hash: '96d26a7cd8cc395b34e8d6e98240a7d92b02991c12990da49110160a795bf6748fb01084512c2a5321f3e1f9e46dbd1edb9930baacc2450024dac317698b25ef',
            result: '75001b1d54872250ee36c77625176fb55d90dcffabc1b69cc05bc089d4be2d07'
        },
        {
            hash: 'bcc9e02dba41d20270e48cab10c308194484cba41b0d9f3de1cd958e5395825554625b007fde78728030869f25727c5ff58e8809ee2eb1120bf433f000effbda',
            result: '51783222475f376e0e5ad64ef3e2851d91a16db4d97f8db29cddc4650eb93003'
        },
    ];

    let sample_for_core_ed25519_scalar_xxxxx = [
        {
            x: 'aeb7e5cc0cec745a51db2a3e56397d348e5a28ead283533c584ac0fbb41b7d02',
            y: '07a4f076fd1632d7f5045d397d6e1e176eb337ed66189eea7a3d3c2d59cec107',
            add: 'b55bd6430a03a73147e08777d3a79b4bfc0d60d7399cf126d387fc280eea3e0a',
            sub: '94e7eab2293855db3173c5a7b7c43d3220a7f0fc6b6bb551dd0c84ce5b4dbb0a',
            mul: '28c2e04cf8d0ce999c60b390d428455f9ff8ad8a76815314517f0ee4ee2f1c00',
            negate_x: '3f1c10900d779dfd84c1cc6488c061e071a5d7152d7cacc3a7b53f044be4820d',
            invert_x: 'e293070163e7467d209be1c728c3e63435b14df12d5f987f0ae53629b3b5bd00',
            complement_x: '401c10900d779dfd84c1cc6488c061e071a5d7152d7cacc3a7b53f044be4820d'
        },
        {
            x: '6783772a9e82f17474ec0ac229041f173ae03432b40344e6f70bef670cfb0f06',
            y: '3c56ba0c3ddfe37260a9fffce4df8a498bdefdd8604a122096449bb159d0770b',
            add: 'b6053cdac0fec28ffef8121c30eaca4bc5be320b154e56068e508a1966cb8701',
            sub: '1801b37a7b06205aeadf0268231e73e2ae01375953b931c661c753b6b22a980a',
            mul: '343226d98815d45aaa03c679e6418f6be90d1c963f0eb6abe05ce1102ca31d09',
            negate_x: '86507e327ce020e361b0ece0b4f5bffdc51fcbcd4bfcbb1908f41098f304f009',
            invert_x: '369dcd2697bff9c4bda9c0b571450b4900093979708387cc3d73171a99b34800',
            complement_x: '87507e327ce020e361b0ece0b4f5bffdc51fcbcd4bfcbb1908f41098f304f009'
        },
        {
            x: 'f7c7a86af4f8f531b01877683df29b7f728121da7726b30cfb986ccb2cb28605',
            y: '2a035cc5b395b4e302865cc6e3f51292a163f4c6e4eeed85637f48d2b2516704',
            add: '21cb0430a88eaa15b39ed32e21e8ae1114e515a15c15a1925e18b59ddf03ee09',
            sub: 'cdc44ca54063414ead921aa259fc88edd01d2d139337c586971924f979601f01',
            mul: 'ebca5c4dff250f684dd948c5205b69fe09136d4852910283229d8bddbc48bc05',
            negate_x: 'f60b4df2256a1c262684803aa10743958d7ede2588d94cf304679334d34d790a',
            invert_x: 'd8c3729771bdb6cc9f4cbb7940a8f6258f6ebfc3c6c220967b82e3c1c2fc870c',
            complement_x: 'f70b4df2256a1c262684803aa10743958d7ede2588d94cf304679334d34d790a'
        },
        {
            x: '4a0d97c99b7c1a7aa5338ab4186b767c529f98d6e63a98118e2ab220f163fb09',
            y: '97293ac19e0618ea657f7628fb68e01a3b7bfb392d9670933c20bd2810455d08',
            add: 'f462db2d2020200c3516093a35da77828d1a941014d108a5ca4a6f4901a95802',
            sub: 'b3e35c08fd7502903fb4138c1d02966117249d9cb9a4277e510af5f7e01e9e01',
            mul: '2e48bd7eacbc751763ad959411dfc78106d3c548e61cbdcbbccb54bed694bb05',
            negate_x: 'a3c65e937ee6f7dd30696deec58e6898ad60672919c567ee71d54ddf0e9c0406',
            invert_x: '509bda4d984c475b9f322593ce9ae3b65f9d9b343dd6967470e5531b20fa2d07',
            complement_x: 'a4c65e937ee6f7dd30696deec58e6898ad60672919c567ee71d54ddf0e9c0406'
        },
        {
            x: 'eb9199e291dec2c1912c4d1bbe71f2d8fe4b5eddf30fc3b877246dcd436cb609',
            y: '470ec731b9559d4aef7449904a933fd6290b24ce0b1d4e5f8e57e89e29f84f0f',
            add: '45cc6ab730d14db4aa049f082a0b539a285782abff2c1118067c556c6d640609',
            sub: '9157c80df3eb37cf7854fb2d52d89117d5403a0fe8f27459e9cc842e1a74660a',
            mul: '4b78e90439016a720c87a2bbd9cc4c0a880c44f5f39d84b2011c6c396aed7b06',
            negate_x: '02425c7a88844f964470aa872088ec3b01b4a1220cf03c4788db9232bc934906',
            invert_x: 'b95459da376bfd00491ebaa4cb02bb8179d84c73eaeb0268d2a214ec1be1340b',
            complement_x: '03425c7a88844f964470aa872088ec3b01b4a1220cf03c4788db9232bc934906'
        },
        {
            x: 'a681e7a32d6433634a58cfe26e95242db08e296ca84180186139f6acc15b7e07',
            y: 'ec5e0111155e8a7307a2f7b4c5c4987a92396fecbbcc8a9a652d02ca59377403',
            add: '92e0e8b442c2bdd651fac697345abda742c89858640e0bb3c666f8761b93f20a',
            sub: 'ba22e6921806a9ef42b6d72da9d08bb21d55ba7fec74f57dfb0bf4e267240a04',
            mul: '32633f0cf7c7faac79af50afa5f99f5604eb1e2530f76d167dbe4b598002080a',
            negate_x: '47520eb9ecfedef48b4428c06f64bae74f71d69357be7fe79ec609533ea48108',
            invert_x: '286cee7f0e96c88a25e18ba899eae2a666a785d491fcd45e8aebb73d12e95107',
            complement_x: '48520eb9ecfedef48b4428c06f64bae74f71d69357be7fe79ec609533ea48108'
        },
        {
            x: 'da4842b151d24acb6348220e510575ee700ca749d7ea8b64d00cca9cbef6230f',
            y: '58209f0fa61cfe4a80b5e1b382d35a750ed65667e769d4a612b4da11ec7f6d02',
            add: '4595eb63dd8b36be0d610c1ff5def04e7fe2fdb0be54600be3c0a4aeaa769101',
            sub: '8228a3a1abb54c80e392405ace311a79623650e2ef80b7bdbd58ef8ad276b60c',
            mul: 'ea0e5c03b3b9242b597a0f07940bcae3478fcba8ff5a3e343ea77e69024dcb0d',
            negate_x: '138bb3abc890c78c7254d5948df469268ff358b62815749b2ff335634109dc00',
            invert_x: 'dad29ab9c7d81e947cfdecc65587ef2f8459d21cbc6fecb3bf1c53c1591e1505',
            complement_x: '148bb3abc890c78c7254d5948df469268ff358b62815749b2ff335634109dc00'
        },
        {
            x: '44673cc7e528212763ae1074b612cc94ecb2022b8d473e5dea474b0de9b47c05',
            y: '46744fdfde3babb098e0c6403366f626af62e83c7bb8138ae53fa75d52ed0b0f',
            add: '9d079649aa01ba7f25f2df110b7fe3a69b15eb67080052e7cf87f26a3ba28804',
            sub: 'ebc6e244215088cea06a41d661a6b4823d501aee118f2ad30408a4af96c77006',
            mul: 'f75e72be862f1c9f439ae837c3caf1689d70ff9aeaf9784a5cadc8b3bc348600',
            negate_x: 'a96cb995343af13073eee62e28e71280134dfdd472b8c1a215b8b4f2164b830a',
            invert_x: '9d0910f33735dad0a1ebc57efd46b9df31b96665b523264ffea6dfc7aec7ce00',
            complement_x: 'aa6cb995343af13073eee62e28e71280134dfdd472b8c1a215b8b4f2164b830a'
        },
        {
            x: '859eb7bae26903daeb100826d21169751b64219e5658a9950465df213a9ce905',
            y: '10638b719b7e170eeed24e04d3469b58a850500eab47ccda417e61e693886f03',
            add: '9501432c7ee81ae8d9e3562aa55804cec3b471ac01a0757046e34008ce245909',
            sub: '753b2c4947ebebcbfd3db921ffcacd1c7313d18fab10ddbac2e67d3ba6137a02',
            mul: '3c7da34157cc9af6ca6e1ea769e80cb99105571b63234984ca68b2f0aae9f80a',
            negate_x: '68353ea237f90e7eea8bef7c0ce8759fe49bde61a9a7566afb9a20dec563160a',
            invert_x: '4bcb4a996480ba72d294125d389882fd99260c60688dff99708f72712857ba08',
            complement_x: '69353ea237f90e7eea8bef7c0ce8759fe49bde61a9a7566afb9a20dec563160a'
        },
        {
            x: '2d4c5fe66d455870aec296de7f4f73d4d382f7d2988cb71804726aecff49d201',
            y: 'f5e29079d0614337cedc5608305650efc28bb72390b3ce432dffce62bd0a5801',
            add: '222ff05f3ea79ba77c9fede6afa5c3c3960eaff62840865c3171394fbd542a03',
            sub: '3869ce6c9de31439e0e53fd64ff922e510f73faf08d9e8d4d6729b89423f7a00',
            mul: '518ddfa8e42f885cbd3903f79940cdd1f7357a989fe12de70d2784a2a86b8309',
            negate_x: 'c0879676ac1dbae727da60c45eaa6b402c7d082d677348e7fb8d951300b62d0e',
            invert_x: 'd57fd2f218fd15ef8c56467da4332bf40e2e93730010d247eb24193d4cbd870c',
            complement_x: 'c1879676ac1dbae727da60c45eaa6b402c7d082d677348e7fb8d951300b62d0e'
        },
        {
            x: 'ae24bcd527e63b8a663a082714177aeeeca5edb77237b3377e9897956b2b150d',
            y: '08a80498dc1c153c77ca98c5295b36fbd608d5178034c907136aa55bec2e370a',
            add: 'c9f8ca10ea9f3e6e0768a9495f78d1d4c3aec2cff26b7c3f91023df1575a4c07',
            sub: 'a67cb73d4bc9264eef6f6f61eabb43f3159d18a0f202ea2f6b2ef2397ffcdd02',
            mul: 'ed8e57ad39cbcc2cd84eb7ba75e0f9e21fbb47bd26afaa5b9e6298a9f8e1f107',
            negate_x: '3faf3987f27cd6cd6f62ef7bcae26426135a12488dc84cc88167686a94d4ea02',
            invert_x: 'f3d376efb6f92bb3eeb6c5fd5a4b1fa440ce2e9adc349fbc29447bfe91cc540d',
            complement_x: '40af3987f27cd6cd6f62ef7bcae26426135a12488dc84cc88167686a94d4ea02'
        },
        {
            x: '4dc330bdd5f12ab65c0c871078a26d436fd0d15a6d6c66631d822284efad010d',
            y: '8fea4c1baeb5ebf22010bf77737212ae9eb98aa10df6c886fc8e4099ff49f700',
            add: 'dcad7dd883a716a97d1c4688eb1480f10d8a5cfc7a622fea1911631deff7f80d',
            sub: 'bed8e3a1273c3fc33bfcc79804305b95d01647b95f769ddc20f3e1eaef630a0c',
            mul: '308416e5a4fb127e8e3ebcbafe7625c7327afde2c646740cb7e667d33ca1c005',
            negate_x: 'a010c59f4471e7a179907092665771d1902f2ea59293999ce27ddd7b1052fe02',
            invert_x: '141bdb6c648a4f5d5f7e4264ee23c1c0e37a8fa8b9cbf236bd729d38e874150b',
            complement_x: 'a110c59f4471e7a179907092665771d1902f2ea59293999ce27ddd7b1052fe02'
        },
        {
            x: 'd4b4cf566b6a99d3e20abec329c7bb0bcc9687852cf4c9045102f5238a70c20c',
            y: 'd33fd03124f37abf0e69737e8c718d273cf4f31c599e56947695a2b4893d7e0b',
            add: 'ba20aa2b75fa013b1bd7399fd73e6a1e088b7ba285922099c79797d813ae4008',
            sub: '0175ff2447771e14d4a14a459d552ee48fa29368d3557370da6c526f00334401',
            mul: '4ce5858f96257e0e897a678d4c060fc66fd031691341eefe40b15334e2ba700d',
            negate_x: '191f2606aff87884f39139dfb43223093469787ad30b36fbaefd0adc758f3d03',
            invert_x: '132835b09ce208a95cfa5ffc7ba904c58f4167311348c032554c1e081db6530f',
            complement_x: '1a1f2606aff87884f39139dfb43223093469787ad30b36fbaefd0adc758f3d03'
        },
        {
            x: '41b63e8fed96ee41242c5d8a89e3c3cf87f56a764f6e2bbe60d2c5cb7bae6608',
            y: '2a40f807e42da73441ef386c4744aa6cbac245940bd74edd7bf029b0a328da02',
            add: '6bf63697d1c49576651b96f6d0276e3c42b8b00a5b457a9bdcc2ef7b1fd7400b',
            sub: '177646870969470de33c241e429f1963cd3225e24397dce0e4e19b1bd8858c05',
            mul: '1fef8d361febef38f47cc048a14f6ab15ec0dd0c91e1957d2623401230491508',
            negate_x: 'ac1db7cd2ccc2316b2709a1855161b45780a9589b091d4419f2d3a3484519907',
            invert_x: 'dbd4533b11d17f0844e921f735cb67006bd1e2bf677ba6604ae281dfa54aff03',
            complement_x: 'ad1db7cd2ccc2316b2709a1855161b45780a9589b091d4419f2d3a3484519907'
        },
        {
            x: '4b5aba4668bf2852577bcfb882845dad0bed5d460ed9073aca818a34096fdd06',
            y: '6989cdd6699879a0eeca4ada3757b2f40c5fe5bdbf7da92aa2a13ba8ba49b305',
            add: 'b4e3871dd257a2f245461a93badb0fa2184c4304ce56b1646c23c6dcc3b8900c',
            sub: 'e2d0ec6ffe26afb168b084de4a2dabb8fe8d78884e5b5e0f28e04e8c4e252a01',
            mul: '4698feeb9a3c2d05e6c2b273e3e1fda97643038d4890513dbc574f7ec361b207',
            negate_x: 'a2793b16b2a3e9057f2128ea5b758167f412a2b9f126f8c5357e75cbf6902209',
            invert_x: '064e45c4b778754f50ca0b68b0839b649d202ed26c40a7ef20e731557f2b780e',
            complement_x: 'a3793b16b2a3e9057f2128ea5b758167f412a2b9f126f8c5357e75cbf6902209'
        },
        {
            x: 'b51f066d1df8d4cdfc3472bc3bb61a02455d3cd8d371661a01ec96a633524d06',
            y: 'a3d72e36120d14477847fdc29be1893c48fe4049702107d95850ae3e47ba500a',
            add: '6b233f4615a2d6bc9edf77dcf89dc5298d5b7d2144936df3593c45e57a0c9e00',
            sub: 'ff1bcd93254ed3de5a8a6c9c7ece6fdafc5efb8e63505f41a89be867ec97fc0b',
            mul: '559e491357f7b8f737ce8c773fa47cce3002356bb9c6b543ebf1d6b6756cb40a',
            negate_x: '38b4efeffc6a3d8ad96785e6a243c412bba2c3272c8e99e5fe136959ccadb209',
            invert_x: '3f90ecf0edfe395dd5a0e5c68e035b6fed158238e6ead4cf088a1da355533509',
            complement_x: '39b4efeffc6a3d8ad96785e6a243c412bba2c3272c8e99e5fe136959ccadb209'
        },
        {
            x: '15cdbe00645e9116bbbcac2f8cd437cca6db43369d5b0dea1dc5249c968ab10b',
            y: '827211fad302ac2b2f45825fad67e6b2b6325ee2cc5aa5f52af5897466b96900',
            add: '973fd0fa37613d42ea012f8f393c1e7f5d0ea2186ab6b2df48baae10fd431b0c',
            sub: '935aad06905be5ea8b772ad0de6c5119f0a8e553d00068f4f2cf9a2730d1470b',
            mul: '3faf757efccdaa1912d842b93e3a1338b0cecc7aff01a45135b2a4ad1fd7d505',
            negate_x: 'd806375cb60481411be04a735225a7485924bcc962a4f215e23adb6369754e04',
            invert_x: '6500d9f9819b191974abf73ff7dd8520232b4257c32fc75f5bef7cc04e182709',
            complement_x: 'd906375cb60481411be04a735225a7485924bcc962a4f215e23adb6369754e04'
        },
        {
            x: 'ca2483ed4904a55b75ad10de9320e2dc18e4b2ec6c234a8fa56fc404027e770a',
            y: '20473ee273d285895bc0bcf7bbbe1f3a930fc1316ef0f89e87a9b15e74944e07',
            add: 'fd97cb72a373188dfad0d53271e52202acf3731edb13432e2d1976637612c601',
            sub: 'aadd440bd6311fd219ed53e6d761c2a285d4f1bafe3251f01dc612a68de92803',
            mul: '711cb02c4463b78c9c20b366d45469f21e37315632a87dd42fead90e30976909',
            negate_x: '23af726fd05e6dfc60efe6c44ad9fc37e71b4d1393dcb5705a903bfbfd818805',
            invert_x: '044bb3e4a1a1d8b1a19800410c7036d96c8c2d7a2bc0c605274027869893ad0e',
            complement_x: '24af726fd05e6dfc60efe6c44ad9fc37e71b4d1393dcb5705a903bfbfd818805'
        },
        {
            x: 'd16a75150cf47b480ee6e0b09403f7e0f09b5ff4e66db4d4c5e9b46cec857d0f',
            y: '104a840d7c0f0ce766ff752a6f9810fb47c02ab15737b0f3136aeb693a9eeb0a',
            add: 'f4e003c66da075d79e485f3825a228c7385c8aa53ea564c8d953a0d62624690a',
            sub: 'c120f10790e46f61a7e66a86256be6e5a8db34438f3604e1b17fc902b2e79104',
            mul: 'a97883ac4ec664ad0112acc7de7995049b41b448f02e4c620e59bdaef14a5008',
            negate_x: '1c6980470e6f960fc8b616f249f6e7330f64a00b19924b2b3a164b93137a8200',
            invert_x: 'a8c30618cde9f31e67218d903dc3163e6a5f28197618755b14afd684caab3507',
            complement_x: '1d6980470e6f960fc8b616f249f6e7330f64a00b19924b2b3a164b93137a8200'
        },
        {
            x: '1345f886527c497d373679dcb46f5e5d5be69f7e8c7ab0c95708a94942c5d90e',
            y: 'd37c37423242b450ec5ffd36821bb8a0f80c5d69c933359ba9682a69bd57ca06',
            add: 'f9ed396c6a5beb754df97e70589137e953f3fce755aee5640171d3b2ff1ca405',
            sub: '40c8c044203a952c4bd67ba53254a6bc62d94215c3467b2eae9f7ee0846d0f08',
            mul: '87d9dce6de08b23d5330871ecf53d6679bc33f6d954bbae5bb637db4baed6e03',
            negate_x: 'da8efdd5c7e6c8da9e667ec6298a80b7a419608173854f36a8f756b6bd3a2601',
            invert_x: 'ae79a2e767b8c33d6cbc8595e98c1ea947a4af9b458888f99d53bb340a2f9e0a',
            complement_x: 'db8efdd5c7e6c8da9e667ec6298a80b7a419608173854f36a8f756b6bd3a2601'
        },
        {
            x: '352541dd3fc0b196a555c96f87789abdb5eb5f1ca2aa24c2d68566605241f206',
            y: 'd03ca986c76fa3f278f759a972ac60318216ebdbb373a88385adb31cb79d060d',
            add: '188ef406edcc423148b02b761b2b1cda37024bf8551ecd455c331a7d09dff803',
            sub: '52bc8db392b320fc02fb6669f3c518a133d57440ee367c3e51d8b2439ba3eb09',
            mul: '6bea29853740798281c75cf5670eec2371b5584937775b2a7c99ff66e064a50c',
            negate_x: 'b8aeb47fdaa260c130472e33578144574a14a0e35d55db3d297a999fadbe0d09',
            invert_x: '083781343fe071261d4f5785781b3d4837fcf61aea23a25747d533239895f700',
            complement_x: 'b9aeb47fdaa260c130472e33578144574a14a0e35d55db3d297a999fadbe0d09'
        },
        {
            x: 'cdae9450ae52e96e0bf68805b0207844b84cd26e3ece972f1daca737a2a9eb0c',
            y: '0657df063b53d17efd5d4c3e70967059aeb127293f74f9eb7902522530cceb01',
            add: 'd3057457e9a5baed0854d54320b7e89d66fef9977d42911b97aef95cd275d70e',
            sub: 'c757b54973ff17f00d983cc73f8a07eb099baa45ff599e43a3a9551272ddff0a',
            mul: '998e3e583c424c762a1b2c11406ce53bd67ad0babbcfef9fbba9137efd3e6100',
            negate_x: '2025610c6c1029e9caa66e9d2ed966d047b32d91c13168d0e25358c85d561403',
            invert_x: '1aab026fe9b79271bf17882681bb583e3fae6cfbe3074a86ac92a3d67d2bdc05',
            complement_x: '2125610c6c1029e9caa66e9d2ed966d047b32d91c13168d0e25358c85d561403'
        },
        {
            x: '4294cf0c426b59512e6138769cf46283633b5c5a113648ff9d78d93add61c701',
            y: '3b7fb77278727cd178a104d944f8b9902408acdc70e6147153ec37ebd464f00d',
            add: '7d13877fbaddd522a7023d4fe1ec1c1488430837821c5d70f1641126b2c6b70f',
            sub: 'f4e80df7e35befd78b5c2b4036f687073f33b07da04f338e4a8ca14f08fdd603',
            mul: 'f0b8d5d90b64d572db2b275c01a8182060f4990a0a7f8b79b0bde3439bd1970b',
            negate_x: 'ab3f2650d8f7b806a83bbf2c42057c919cc4a3a5eec9b700628726c5229e380e',
            invert_x: 'f2f151b10d32e01c94e08443c588dda670d94d6f348476d62c6078e3ebd7fe0c',
            complement_x: 'ac3f2650d8f7b806a83bbf2c42057c919cc4a3a5eec9b700628726c5229e380e'
        },
        {
            x: '8caf38f681689ff185921c044430a50b55895145fd02e190b935d95e0f590600',
            y: 'ee4ed1e91a1a950ec9b7f0a840ca89dbcf61de5c34c7cbfa3f09a11b2016f10b',
            add: '7afe09e09c8234004f4a0dad84fa2ee724eb2fa231caac8bf93e7a7a2f6ff70b',
            sub: '8b345d6981b11c3b937723fee15ffa44852773e8c83b1596792c3843ef421504',
            mul: '9e4b779aed42147fcf70034765e9bd1cf915e38d7a353a4ae5bb60b3f1c7a10f',
            negate_x: '6124bd6698fa7266500adb9e9ac93909ab76aeba02fd1e6f46ca26a1f0a6f90f',
            invert_x: 'd30a559b78307547e7ea6af1a6b00128bcee5f61de4bbfbb0bae86746ef9590d',
            complement_x: '6224bd6698fa7266500adb9e9ac93909ab76aeba02fd1e6f46ca26a1f0a6f90f'
        },
        {
            x: '69b00b3805812168207fbd87156d8075217629fe853d8aab73f575f89fcb4309',
            y: 'b373265c01e2c6acf5f9be70741e44bb74c610a5d7cc3f0660557ddb81db380d',
            add: '2f503c37ecffd5bc3fdc8455ab91e51b963c3aa35d0acab1d34af3d321a77c06',
            sub: 'a310db381e026d130122f6b97f481bcfacaf1859ae704aa513a0f81c1ef00a0c',
            mul: '22e5ee86e45471d5bb3a660f7f91e20e5f1cb907f2aa7e2ca97ff19de5afa404',
            negate_x: '8423ea2415e2f0efb51d3a1bc98c5e9fde89d6017ac275548c0a8a076034bc06',
            invert_x: 'bd855c86dad87f43aa90ee467bcda72d7188c28926f74457e82ab5c533477403',
            complement_x: '8523ea2415e2f0efb51d3a1bc98c5e9fde89d6017ac275548c0a8a076034bc06'
        },
        {
            x: 'ac2620df489ed9293aa6c1394168be86509f762659dc3ab0970bc6b57f092c07',
            y: 'ac11b65169d7df904b2ef73fd7862e2c51328ba932bc6dffbdadd692a9e2190c',
            add: '6b64e0d39712a762af37c1d639f50d9ea1d101d08b98a8af55b99c4829ec4503',
            sub: 'ede85feaf9290cf1c414c29c48db6e6fff6ceb7c2620cdb0d95def22d626120b',
            mul: 'd0a2aa1559fd9a40a193bfd7b3a20f371dde4074f98dbaa9dd878c1bd16b580c',
            negate_x: '41add57dd1c4382e9cf635699d91208eaf6089d9a623c54f68f4394a80f6d308',
            invert_x: '7bdaef09176b4094594f2b46640562fe1148c6186e37a0cb7945e8ae88112b0d',
            complement_x: '42add57dd1c4382e9cf635699d91208eaf6089d9a623c54f68f4394a80f6d308'
        },
        {
            x: 'af5da319285c7feb0276629d08c913424d448904f13c25dd7613e153ad98d607',
            y: '533a053299332cc9337f5f34e0959bf701074f3d80b845e27cfdaea8f868e305',
            add: '0298a84bc18fabb436f5c1d1e85eaf394f4bd84171f56abff31090fca501ba0d',
            sub: '5c239ee78e285322cff602692833784a4b3d3ac77084dffaf91532abb42ff301',
            mul: '57ff221f0f494474e3835d050036bddd5de324fdd85274c3ef1e01120de5b605',
            negate_x: '3e765243f206936cd3269505d630cbd2b2bb76fb0ec3da2289ec1eac52672908',
            invert_x: 'd76ba7cbf3eb542c916f242f0cabd5724e72b929256c809139555b7d409b5a0e',
            complement_x: '3f765243f206936cd3269505d630cbd2b2bb76fb0ec3da2289ec1eac52672908'
        },
        {
            x: '8979882a50463cb7ea1a082da37d8d7fdf9ace0f7b0fca8497e78de1b79c0500',
            y: '6d3de9688cd865b18ff04cfcd87adbcb3612b6454bd0810237a8cf502988920b',
            add: 'f6b67193dc1ea2687a0b55297cf8684b16ad8455c6df4b87ce8f5d32e124980b',
            sub: '0910951eded0e85d31c7b2d3a8fc90c8a88818ca2f3f4882603fbe908e147304',
            mul: 'd7cf0c2b98983789b3cd427a5a7d1c145ea66c0b479539c592b6ffe60f7e2c05',
            negate_x: '645a6d32ca1cd6a0eb81ef753b7c5195206531f084f0357b6818721e4863fa0f',
            invert_x: '5a9c901bd34da5cb62201695e3d3547f4d8f7c1d8874bf7bf2fcc9d5485ddf09',
            complement_x: '655a6d32ca1cd6a0eb81ef753b7c5195206531f084f0357b6818721e4863fa0f'
        },
        {
            x: 'eae70f5510dc078ae731d582d68c22e6da50631d31c6244777915b996fc76d0d',
            y: '829889c569337341745ec09855daab98a12443a86f8983604dbf5c319cfabb0f',
            add: '7faca3bd5fac687385f39d784d6def697c75a6c5a04fa8a7c450b8ca0bc2290d',
            sub: '55237cecc00ba7a049700c8d5fac5562392c2075c13ca1e629d2fe67d3ccb10d',
            mul: 'dcfec7ad994ea17f10cc993b118b347926ca774a1327e9991fcc97d1514c4f02',
            negate_x: '03ece5070a870aceee6a2220086dbc2e25af9ce2ce39dbb8886ea46690389202',
            invert_x: 'b555e98c24d7beafd45ce85ba086b72502bf3e077a3d07b143dc2b40cbbc5302',
            complement_x: '04ece5070a870aceee6a2220086dbc2e25af9ce2ce39dbb8886ea46690389202'
        },
        {
            x: 'bb2727fb167fee9fe6aade36d6942912308634664d5fd1ad938df80151b1ae08',
            y: 'de601f08d380ef98403bf0b4b5e37915b1436bb9588eda4b99c94b0de95e4f00',
            add: '99884603eaffdd3827e6ceeb8b78a327e1c99f1fa6edabf92c57440f3a10fe08',
            sub: 'ddc607f343fefe06a66fee8120b1affc7e42c9acf4d0f661fac3acf467525f08',
            mul: 'e8d8fe63662ed15e782a392070c0db040b1229af15f0b83da27ac099970bc706',
            negate_x: '32acce6103e423b8eff1186c0865b502d079cb99b2a02e526c7207feae4e5107',
            invert_x: 'c4249fdd764b54548c907e7a17357cf8bbd241282bc5410aae895eb3b3d1f905',
            complement_x: '33acce6103e423b8eff1186c0865b502d079cb99b2a02e526c7207feae4e5107'
        },
        {
            x: '4a22df9e23f7427d4c8f13560f84bb1fff877c3b4ca5d2ada0e159df1506b20b',
            y: '644b10965f9c60048e000d186929f606b517288e7c994828524c8cb21bfb9d00',
            add: 'ae6def348393a381da8f206e78adb126b49fa4c9c83e1bd6f22de6913101500c',
            sub: 'e6d6ce08c45ae278be8e063ea65ac5184a7054adcf0b8a854e95cd2cfa0a140b',
            mul: '7243ecdc29906ded65ba1341d377d9a841c9ecba370d2807cf49368c3fc7770e',
            negate_x: 'a3b116bef66bcfda890de44ccf7523f5007883c4b35a2d525f1ea620eaf94d04',
            invert_x: 'd66febb8afacc538a2f15dc9ae3cc570fc54e8cc2732566c68ed128e6ee8060e',
            complement_x: 'a4b116bef66bcfda890de44ccf7523f5007883c4b35a2d525f1ea620eaf94d04'
        },
        {
            x: 'df8ab7c5712e97ff2ab3b91a794a164527ac1fb04014562c0f6a8da749d65f0a',
            y: 'a0d6a016d9d912f50da7248b781a222b593577b0cd0a295292d4648ac6315a03',
            add: '7f6158dc4a08aaf4385adea5f164387080e196600e1f7f7ea13ef2311008ba0d',
            sub: '3fb416af9854840a1d0c958f0030f419ce76a8ff72092dda7c95281d83a40507',
            mul: '92bbdafe6da4c3f9e53fcd14bef2a12eaf9c1bca2daf2befb5d0e0dae27ad908',
            negate_x: '0e493e97a8347b58abe93d8865afc8cfd853e04fbfeba9d3f0957258b629a005',
            invert_x: 'bd684f47d49f1b17394f71768e2b0d55feb8b21539697952c10a9a531cfa700d',
            complement_x: '0f493e97a8347b58abe93d8865afc8cfd853e04fbfeba9d3f0957258b629a005'
        },
        {
            x: 'b3ae4590a253a4e81e4f8520bff9cc1df137d9e7f4f64e3675fa81923f3ef203',
            y: '1018308e9f50e27f4639ea641c54922e0caa7b554d90a13601d37512f08dbe04',
            add: 'c3c6751e42a4866865886f85db4d5f4cfde1543d4287f06c76cdf7a42fccb008',
            sub: '906a0b5f1d66d4c0aeb2925e819f1904e58d5d92a766adff73270c804fb0330f',
            mul: '836f15995b285f456cbd2edbde5adb40dfd24cbfcb706778ab55d0b19e2e8801',
            negate_x: '3a25b0cc770f6e6fb74d72821f0012f70ec826180b09b1c98a057e6dc0c10d0c',
            invert_x: '91fa3855d7810f06da7dd04c8157ce429e11476580f4b792811b15a5a8e69d0f',
            complement_x: '3b25b0cc770f6e6fb74d72821f0012f70ec826180b09b1c98a057e6dc0c10d0c'
        },
        {
            x: 'ac662b155acc006c36d808853f2bf0d2e1a3f608aba1d5e5db1fc75eb53b1104',
            y: 'd99bae1c472295e2d29405848c5ec54b3a1e8ec7eaa732731b886ccbbaf1b701',
            add: '8502da31a1ee954e096d0e09cc89b51e1cc284d095490859f7a7332a702dc905',
            sub: 'd3ca7cf812aa6b8963430301b3cc2a87a7856841c0f9a272c0975a93fa495902',
            mul: '9dcafc89719b0d8f9b15aa89645187665b1e43253d1e78f01b05615ccdfd600d',
            negate_x: '416dca47c09611ec9fc4ee1d9fceee411e5c09f7545e2a1a24e038a14ac4ee0b',
            invert_x: 'dc774a95242b7cbf574505536f1acf74493ec58e84e7f8fcbedca74cc993e60f',
            complement_x: '426dca47c09611ec9fc4ee1d9fceee411e5c09f7545e2a1a24e038a14ac4ee0b'
        },
        {
            x: 'b8664c401f48802c04480e18bf3d2410fcdf4911a88d728fbda8d101d0d0980f',
            y: 'f34f6cdcb0c10388c27e8e621c6e805873daafc33529f0df07bf55fce3eb8f07',
            add: 'bee2c2bfb5a6715cf029a5d7fcb1c5536fbaf9d4ddb6626fc56727feb3bc2807',
            sub: 'c516e0636e867ca441c97fb5a2cfa3b788059a4d726482afb5e97b05ece40808',
            mul: '398ee9b8ca509e1711f87ddd7665e1d4abae80285032558416d63aea78ff330f',
            negate_x: '356da91cfb1a922bd254e98a1fbcba040420b6ee57728d7042572efe2f2f6700',
            invert_x: 'a8d550eb967186906664ab71e70206dd2c4a654e99dcccea7dd67849bc826504',
            complement_x: '366da91cfb1a922bd254e98a1fbcba040420b6ee57728d7042572efe2f2f6700'
        },
        {
            x: 'eab55099adf244a932c942912a1ecd99e539a58dd6839be44bad4276f1a4630f',
            y: '64a8ef7484dded9c5c81e10f30ccff301f963410e515027b2f20ff3d769ea704',
            add: '618a4ab1176d20eeb8ad2cfe7bf0edb504d0d99dbb999d5f7bcd41b467430b04',
            sub: '860d61242915570cd6476181fa51cd68c6a3707df16d99691c8d43387b06bc0a',
            mul: 'bad6fb1d0f795198584919ad9c190ebed643aad9e97ddf55557bf198effa6e0a',
            negate_x: '031ea5c36c70cdaea3d3b411b4db117b1ac65a72297c641bb452bd890e5b9c00',
            invert_x: '32d88d06254e4a2b0d7e8bb7f4ec599c49a9762d1d2c30199b942d6dfec80107',
            complement_x: '041ea5c36c70cdaea3d3b411b4db117b1ac65a72297c641bb452bd890e5b9c00'
        },
        {
            x: 'cc88a064abf1fc06fbe8f6453ddf464326141bad5b1cabe9d5f7aa949a7fd60d',
            y: 'e79772ab794ed19e4ed1491e0717c3e779edcb64e7023ada22feb3a35754380b',
            add: 'c64c1db30addbb4d731d49c165fc2a16a001e711431fe5c3f8f55e38f2d30e09',
            sub: 'e5f02db931a32b68ac17ad2736c8835bac264f487419710fb3f9f6f0422b9e02',
            mul: '9bc792fbfd58f517691e08166c372961464a94a8c446b883231431264855c20c',
            negate_x: '214b55f86e711551dbb3005da11a98d1d9ebe452a4e354162a08556b65802902',
            invert_x: '80a9556585319a39398a06716eb74ace9512e8f872c943cf9fa53c662f55b90b',
            complement_x: '224b55f86e711551dbb3005da11a98d1d9ebe452a4e354162a08556b65802902'
        },
        {
            x: '86ca070f9f42557e42135d8a595a91ec9b694a71a0ddc727e22c2a6a1de2f20f',
            y: '427cf4e91f74e9b4bc80180cd93e08e74de1a558deb36c4c7f041dbb2830f101',
            add: 'db72069ca4532cdb28f77df3539fbabee94af0c97e913474613147254612e401',
            sub: '444e13257fce6bc98592447e801b89054e88a418c2295bdb62280daff4b1010e',
            mul: 'd6a88f4c99bae2d48f45546bf82e6c39c1287b3ae88b28b190b14f304dbf0208',
            negate_x: '6709ee4d7b20bdd993899a18859f4d286496b58e5f2238d81dd3d595e21d0d00',
            invert_x: '71fed07caff6c86d0f09d9a967766eb65f96f4fb31a7ee0c5671d8af1b5d820d',
            complement_x: '6809ee4d7b20bdd993899a18859f4d286496b58e5f2238d81dd3d595e21d0d00'
        },
        {
            x: '13569da624518ed1e68a0fd9183a98b9ef0a4e8885a7e9d1f6c5e15c55cf5d03',
            y: '7a36343c878c80bcbaeebfbb41cd554616ae37e112ab07e96e8cc209060f3702',
            add: '8d8cd1e2abdd0e8ea179cf945a07eeff05b985699852f1ba6552a4665bde9405',
            sub: '991f696a9dc40d152c9c4f1dd76c4273d95c16a772fce1e887391f534fc02601',
            mul: '89e28d534c7671bf5e2e1a7a53e0200dae28e83569b2631cdad58b648b854701',
            negate_x: 'da7d58b6f5118486ef11e8c9c5bf465b10f5b1777a58162e093a1ea3aa30a20c',
            invert_x: '3e19814cb35862d4f6f098c6469c619ff2fd6985ff363928f4e3f0e6668c0a0d',
            complement_x: 'db7d58b6f5118486ef11e8c9c5bf465b10f5b1777a58162e093a1ea3aa30a20c'
        },
        {
            x: '11e71852ce0810e90a45f1ca11b13a346753bb6c2f68c0b43fb8de8f6f17d505',
            y: 'ad2409cac33a15242c28db02ba7d2b9a480741149045756dff1d9d57fae6cf0d',
            add: 'd1372cbf77e012b560d0d42aed3487b9af5afc80bfad35223fd67be769fea403',
            sub: '519605e524310d1db5b90d6b362deeae1e4c7a589f224b47409a413875300508',
            mul: 'b0ac34691e970ecc928eaab03e350cbbceeeec0d328098374e6b90a6ac83830f',
            negate_x: 'dcecdc0a4c5a026fcb5706d8cc48a4e098ac4493d0973f4bc047217090e82a0a',
            invert_x: 'e3c8283fc7b9ebb40c4dfc75e1e7eb508ae55adc1921b28b129f74f7fd30c20d',
            complement_x: 'ddecdc0a4c5a026fcb5706d8cc48a4e098ac4493d0973f4bc047217090e82a0a'
        },
        {
            x: '70f499da50bd22446591d0f16508426c7314e84f1aa057d6591bc665557e8b06',
            y: '8579276cbb8b30627347c5ee9891e03f228a42a8224724bd3630e9203b62e201',
            add: 'f56dc1460c4953a6d8d895e0fe9922ac959e2af83ce77b93904baf8690e06d08',
            sub: 'eb7a726e9531f2e1f1490b03cd76612c518aa5a7f758331923ebdc441a1ca904',
            mul: '0997e3a92a55f06fe93041a9c91179503f5092dd724544857101509564a7ae08',
            negate_x: '7ddf5b82c9a5ef13710b27b178f19ca88ceb17b0e55fa829a6e4399aaa817409',
            invert_x: '4617d5f790159fc342560cea0e863415cc2792aa73d25ddcd612c066f28ebc0e',
            complement_x: '7edf5b82c9a5ef13710b27b178f19ca88ceb17b0e55fa829a6e4399aaa817409'
        },
        {
            x: 'd89f37e965e7e4a362b6356730f679972b1630b19de3d752150618d878329802',
            y: 'd3ba6f8b96a7ce2416cdb6261862b35006a1474d2a73e84a7aeb3916ea76dd0a',
            add: 'ab5aa774fc8eb3c87883ec8d48582de831b777fec756c09d8ff151ee62a9750d',
            sub: 'f2b8bdbae9a228d7228676e3f68da55b2575e8637370ef079b1adec18ebbba07',
            mul: '4836bc43bdae2be327ad02d6ea7305e0531c201c71e104c0cc5fc7173db37000',
            negate_x: '1534be73b47b2db473e6c13bae03657dd4e9cf4e621c28adeaf9e72787cd670d',
            invert_x: '4f4cb530af1644037877a63676f591de6d99b9ce4892ecce7382ea1d0138f904',
            complement_x: '1634be73b47b2db473e6c13bae03657dd4e9cf4e621c28adeaf9e72787cd670d'
        },
        {
            x: '2171ec999da6ed9197a366f5bc39849c3d84d3c03b164ef3615c9e04787bc108',
            y: 'e122df8386da2b4d120defa1324804f25bd84b7bc3e3d86ea3df33eb1a83d80b',
            add: '15c0d5c0091e0787d3135ef41088a979995c1f3cfff92662053cd2ef92fe9904',
            sub: '2d220373312fd49c5b336ff668eb5ebfe1ab874578327584be7c6a195df8e80c',
            mul: '3581a0953cb20a817f47998f957e0620153e215ba7612e88935bbf7ba16fe800',
            negate_x: 'cc6209c37cbc24c63ef990ad21c05a78c27b2c3fc4e9b10c9ea361fb87843e07',
            invert_x: 'bc0d35bde63cc7a40f642bae413cb5d44a880a6fa4d5900a22b06af9f78c2c0f',
            complement_x: 'cd6209c37cbc24c63ef990ad21c05a78c27b2c3fc4e9b10c9ea361fb87843e07'
        },
        {
            x: '279a5904f1d3ad64d55c627898c37c3756401949a0a887ee5875e8234337bf07',
            y: 'a20b3e4e754e158b19f0bb94ed862e4cf6c3a717b86e4f52fa9aac059818c504',
            add: 'c9a597526622c3efee4c1e0d864aab834c04c1605817d74053109529db4f840c',
            sub: '858e1bb67b8598d9bb6ca6e3aa3c4eeb5f7c7131e839389c5eda3b1eab1efa02',
            mul: '5aa888c381e9029a62a0f7978b5d56be0a7d9febefa5080181891173b04cd205',
            negate_x: 'c6399c58298f64f30040952a463662dda9bfe6b65f577811a78a17dcbcc84008',
            invert_x: 'e9ab97528af20114a657d89d1674bc82b554de49ea769c3f9452d50b7869b205',
            complement_x: 'c7399c58298f64f30040952a463662dda9bfe6b65f577811a78a17dcbcc84008'
        },
        {
            x: 'b67b4fc241930bc2214745fcd7d23248265eecf2c1b8b9911c43150edbfca605',
            y: 'e7126c4bdc97ac5fd590cbd0eb33b59d444c115abcfe6a1a45a2964012fba70a',
            add: 'b0bac5b003c8a5c9203b192ae50c09d16aaafd4c7eb724ac61e5ab4eedf74e00',
            sub: 'bc3cd9d37f5e71ba225371ceca985cbfe111db9805ba4e77d7a07ecdc801ff0a',
            mul: 'e08374047c4c76ce17eecdca31d24ed316639b2a1d267ded25692f326cb98e0b',
            negate_x: '3758a69ad8cf0696b455b2a60627acccd9a1130d3e47466ee3bceaf12403590a',
            invert_x: '277be0c2cbac171f993a805f2eebed8824597b023631f126818f09cfe0c4e80f',
            complement_x: '3858a69ad8cf0696b455b2a60627acccd9a1130d3e47466ee3bceaf12403590a'
        },
        {
            x: '41c0b242d6e2bfdba8a78e65ff6c9ed332a8e214337558dae9d9feaf0eada903',
            y: 'a3ca40a2d175f0e23775795762dbad35f5e5fecdfd3ee041a6c306e9ea136202',
            add: 'e48af3e4a758b0bee01c08bd61484c09288ee1e230b4381c909d0599f9c00b06',
            sub: '9ef571a0046dcff87032150e9d91f09d3dc2e346353678984316f8c623994701',
            mul: '582c57366d11978f450a702fc7b417bae33bce9f21e1dfcf961c20db9c061505',
            negate_x: 'ac13431a4480527c2df5683ddf8c4041cd571debcc8aa72516260150f152560c',
            invert_x: '81c86c2fabbd40670ab6b922ae0a6c7fa9dc0be162d31f7a27872175b0c0ed06',
            complement_x: 'ad13431a4480527c2df5683ddf8c4041cd571debcc8aa72516260150f152560c'
        },
        {
            x: 'b8115bafb5d76ad33a0e0595b8fa5dbb260254713b5fbb4e213cd67b39032907',
            y: 'ea08763c9f644187c9d12132c93328d3604aab8c498980c05a0db6b34d45dc02',
            add: 'a21ad1eb543cac5a04e026c7812e868e874cfffd84e83b0f7c498c2f8748050a',
            sub: 'ce08e5721673294c713ce362efc635e8c5b7a8e4f1d53a8ec62e20c8ebbd4c04',
            mul: 'b28ccd6c8cfee9021eff32fe7c6d8a1a1b6dd24ce94fd90ede30c46486407e03',
            negate_x: '35c29aad648ba7849b8ef20d26ff8059d9fdab8ec4a044b1dec32984c6fcd608',
            invert_x: 'c1c69cefa48eefd886071b6d1381a728a4c7c3fde90ad03345452cce5b02ba09',
            complement_x: '36c29aad648ba7849b8ef20d26ff8059d9fdab8ec4a044b1dec32984c6fcd608'
        },
        {
            x: '9c2178c541f6f15c2d900d483f72e0d39ff4d96a446e25527d9bd2f7a1bcec0f',
            y: '177fa57885433e4ad092cd56e40c71ee2f54b1668014d819a5ac12a5d3fecb01',
            add: 'c6cc27e1acd61d4f2786e3fb448572adcf488bd1c482fd6b2248e59c75bbb801',
            sub: '85a2d24cbcb2b3125dfd3ff15a656fe56fa02804c4594d38d8eebf52cebd200e',
            mul: '22071299020a62c16df5caf0129e3a4c09698857cff1b50dbca5b8bff3136d07',
            negate_x: '51b27d97d86c20fba80cea5a9f87fe40600b2695bb91daad82642d085e431300',
            invert_x: '379fe84a6b26c6557d6561897e1d96361f0e8864ab1d416e3b0a851bbf4c8d08',
            complement_x: '52b27d97d86c20fba80cea5a9f87fe40600b2695bb91daad82642d085e431300'
        },
        {
            x: '5c96c2e3e7a65ca2e4e3dc922cc3e6dcdfd8cb3fda0899137d87c7031360d004',
            y: '8f43a270255f07d0aaa65954b44ec5d99ace9ceabf93aa91c9a5c5c99d182a08',
            add: 'ebd964540d0664728f8a36e7e011acb67aa7682a9a9c43a5462d8dcdb078fa0c',
            sub: 'ba2616d0dcaa672a10da7ae1566e0018450a2f551a75ee81b3e1013a7547a60c',
            mul: '15b9be2a397d81c048598390bf3b463a089005613f5cd43adea32de490e7d20a',
            negate_x: '913d337932bcb5b5f1b81a10b236f837202734c025f766ec827838fcec9f2f0b',
            invert_x: '1212864b80af87bb179e69dc49465f6d3a56ef10133130b30b41a11b330d3506',
            complement_x: '923d337932bcb5b5f1b81a10b236f837202734c025f766ec827838fcec9f2f0b'
        },
        {
            x: '6d8374041c1ca06c85b25ed5697c38e9a4b84c648602e11d9d6f04ca147f3702',
            y: '3906127535c198c19f7e47e77cce22af5aad9c0f97f279db1ce4af13edc94f0d',
            add: 'a689867951dd382e2531a6bce64a5b98ff65e9731df55af9b953b4dd0149870f',
            sub: '215158ec00be1903bcd00e91cba7f44e4a0bb054ef0f6742808b54b627b5e704',
            mul: '48ee6a103e4c611bc6aac3c3d0964d099e53ebe6ff59ee7d03a2742a1f489208',
            negate_x: '80508158fe4672eb50ea98cd747da62b5b47b39b79fd1ee26290fb35eb80c80d',
            invert_x: '824e8510ccc83d36e1cec59c94576ea3983d8709b38bbfd613b0fa2c70c4be0a',
            complement_x: '81508158fe4672eb50ea98cd747da62b5b47b39b79fd1ee26290fb35eb80c80d'
        }
    ];

    it ('Test of JSBIUtils.Sum', () =>
    {
        let sum = JSBIUtils.Sum(
            [
                JSBI.BigInt(1),
                JSBI.BigInt(2)
            ]);

        assert.deepStrictEqual(sum, JSBI.BigInt(1+2));
    });

    it ('Test of JSBIUtils.SumMultiply', () =>
    {
        let sum = JSBIUtils.SumMultiply(
            [
                JSBI.BigInt(2),
                JSBI.BigInt(3),
                JSBI.BigInt(4),
                JSBI.BigInt(5)
            ]);

        assert.deepStrictEqual(sum, JSBI.BigInt(2*3 + 4*5));
    });

    it ('Test fe25519_tobytes and fe25519_frombytes', () =>
    {
        let bytes = new Uint8Array(32);
        let source = new FE25519([-10913610, 13857413, -15372611, 6949391,   114729, -8787816, -6275908, -3247719, -18696448, -12055116]);
        let temp = new FE25519();
        fe25519_tobytes(bytes, source);
        fe25519_frombytes(temp, bytes);
        assert.deepStrictEqual(temp, source);
    });

    it ('Test crypto_core_ed25519_from_uniform', () =>
    {
        sample_random.forEach((m) =>
        {
            let random = Buffer.from(m.random, "hex");
            let res = Buffer.from(crypto_core_ed25519_from_uniform(random));
            let expected = Buffer.from(m.crypto_core_ed25519_from_uniform, "hex");
            assert.deepStrictEqual(res, expected);
        });
    });

    it ('Test crypto_core_ed25519_add and crypto_core_ed25519_sub', () =>
    {
        sample_point_add_sub.forEach((m) =>
        {
            let p = Buffer.from(m.p, "hex");
            let q = Buffer.from(m.q, "hex");
            let add = Buffer.from(crypto_core_ed25519_add(p, q));
            assert.deepStrictEqual(add, Buffer.from(m.add, "hex"));

            let sub = Buffer.from(crypto_core_ed25519_sub(p, q));
            assert.deepStrictEqual(sub, Buffer.from(m.sub, "hex"));
        });
    });

    it ('Test crypto_core_ed25519_is_valid_point', () =>
    {
        let valid = Buffer.from("1b511086a109b23b9d38a5c809894c44ddc4bda498575d8fd3d0b8856e6f4fab", "hex");
        assert.ok(crypto_core_ed25519_is_valid_point(valid));

        let invalid = Buffer.from("1c511086a109b23b9d38a5c809894c44ddc4bda498575d8fd3d0b8856e6f4fab", "hex");
        assert.ok(!crypto_core_ed25519_is_valid_point(invalid));

        let invalid2 = Buffer.from("0000000000000000000000000000000000000000000000000000000000000000", "hex");
        assert.ok(!crypto_core_ed25519_is_valid_point(invalid2));
    });

    it ('Test crypto_core_ed25519_scalar_reduce', () =>
    {
        sample_for_crypto_core_ed25519_scalar_reduce.forEach((elem) =>
        {
            let hash = Buffer.from(elem.hash, "hex");
            let result = crypto_core_ed25519_scalar_reduce(hash);
            assert.deepStrictEqual(Buffer.from(result).toString("hex"), elem.result);
        });
    });

    it ('Test crypto_core_ed25519_scalar_random', () =>
    {
        const ED25519_L = Buffer.from("1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed", "hex").reverse();
        const ZERO =      Buffer.from("0000000000000000000000000000000000000000000000000000000000000000", "hex");

        for (let idx = 0; idx < 50; idx++)
        {
            let scalar = Buffer.from(crypto_core_ed25519_scalar_random());
            assert.ok((Utils.compareBuffer(scalar, ZERO) > 0) && (Utils.compareBuffer(scalar, ED25519_L) < 0));
        }
    });

    it ('Test crypto_core_ed25519_scalar_xxxxx', () =>
    {
        sample_for_core_ed25519_scalar_xxxxx.forEach((elem) =>
        {
            let x = Buffer.from(elem.x, "hex");
            let y = Buffer.from(elem.y, "hex");
            //assert.deepStrictEqual(Buffer.from(crypto_core_ed25519_scalar_add(x, y)).toString("hex"), elem.add);
            //assert.deepStrictEqual(Buffer.from(crypto_core_ed25519_scalar_sub(x, y)).toString("hex"), elem.sub);
            assert.deepStrictEqual(Buffer.from(crypto_core_ed25519_scalar_mul(x, y)).toString("hex"), elem.mul);
            //assert.deepStrictEqual(Buffer.from(crypto_core_ed25519_scalar_negate(x)).toString("hex"), elem.negate_x);
            //assert.deepStrictEqual(Buffer.from(crypto_core_ed25519_scalar_invert(x)).toString("hex"), elem.invert_x);
            //assert.deepStrictEqual(Buffer.from(crypto_core_ed25519_scalar_complement(x)).toString("hex"), elem.complement_x);
        });
    });

});
