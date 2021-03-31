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
});
