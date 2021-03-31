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

    crypto_sign_ed25519_sk_to_curve25519,
    JSBIUtils
} from '../../src/modules/crypto/'

import * as assert from 'assert';

let sample_crypto_sign_ed25519_sk_to_curve25519 = [
    {
        privateKey: 'a51b778be12e9c4e08860491f30b0b0605c42c3ca52cc795b75f20e73ac211a8c1ad7626170ce154129019174ac9919aecdf4833ef93774490e4a85b556fa892',
        result: 'f8a09eec8aef3baf744486bf8eac04c0261fdda44b5791b94cebb3c09ec8766f'
    },
    {
        privateKey: 'a9da2d2f5ff52112d22fedca04daca9fb68325e5c2b9a04013d2c2b111cb9404c3ad413c69dc77b8d6c9b58ea0b755bc310485bfa0d0c7cd90a7e27c58a7bc81',
        result: 'f8ac1059024fd3a3bad3eb842e044d4ad5ee57260f90be0c70d3cf5b558fce72'
    },
    {
        privateKey: '6127233e151d947634500c18277a5a376b5f0ed197845d76b64d7ee373b73ad0c5ad08a5507996c7347f88c8a0d5cca047c9a7d082cb2e9d32cca26fccdaafdc',
        result: 'e0d462b59042e6f54737887b03ee58a454f6bcca177887d2e27886293b6c1370'
    },
    {
        privateKey: '15d10d5ae6d0e9c89213b158226c1160762ab4ff5c5aa7ac4463fce8ad3cdbd6c7ad1f93344d2e91add8ce1331829648b53a2a2667c9655351f2494eb0639b12',
        result: '88fc3a6bd98ad0713160ba55148bf4714ef906f6d62d9586d200d3670ffcb457'
    },
    {
        privateKey: '77719e7f7b254c117be16e5e5f619a9926be8a5570019305df96a619090ac308c9ad07297bd8458214c8611f9a685b4ec950f2ea741ab154df96fb6e525429fd',
        result: '400ab4b1e8c6cb87a5780b6e1a718a6a72a767a43d9e364d87378be453ec3541'
    },
    {
        privateKey: 'bfe92e02c199ea2e07dc4b3411ccf300c392cb6153c2622c77bfacc4a5b22277cbad12da166da55632595a64c1d398cfdbd9cafb1686e5f67775eb5ae960ef4d',
        result: '306231c2813b633f6cd8cd8cf2efaa81960cc36a7f668518426e80f6719b9e4f'
    },
    {
        privateKey: '3e30a17b03d59dca8f42e2ea2052eb87de20b885e10f50e0dafe4e95e8bde4a5cdad07a59bee4eccf060a661d05c5974de0ca5e71e6be96829b966d33904f8bf',
        result: '40b9100942e350139d78cc4ffc897728ef1c7f599ac7420c99b79b01b0f0c379'
    },
    {
        privateKey: '66086d766497e7c125c993070a52e9d7fc8d36f0d315fdb84b9b50b4b10df178cfad495eb957ec9271314f83a3173be322c751b4f91ce29dc37082f82838a2a7',
        result: '20d7e6833e8ef9b579699c180192e1e05f398b12c6a5865c53f16c15f2dcd352'
    },
    {
        privateKey: 'b869018d2779a62b92e2458b47c8a6776fc24ecaec8ce7ba8ca7c1d9ba72336cd1ad2ffa89ad8d848556ab40d98964b34eca0d1416de9445e7bf12a30dea998d',
        result: '18480a4964cb69331b50ce2310c6633da6785fcf0cde2f917e674dc99e98a678'
    },
    {
        privateKey: '2f2ab96f6e8d36be5f580a945c8fb7f95bf326863729bacabf02e96768ce3d55d3ad7e98f729caadd6fff6a44fdc89cf1caa39283f897d856255db5064808842',
        result: 'e06c9fca70eccf8db783d2953148204a706a137c82cff3c2450475512a1df66f'
    },
    {
        privateKey: 'a450aeed7f64a5ed33d4caf35e1f9c21682a78e91ef0af7f14b98b9eb2d16e56d5ad6e4a88b501eca545e594c57e92a08e31696d521e149bef9c4456a6b1820b',
        result: '88bbba16c07e1b8fac02de80accb6522c6bf3425eacb38ea82f384c1ef147d63'
    },
    {
        privateKey: 'f12255a07da7c6871e4dd883c06803e34f6310e10af64a0661f24897b84292fcd7ad19b7508dd82f3ab1be6a5fa1faef8a9680e429d40d43e92470b0d9b96893',
        result: 'f0fdf27568a075e960ccf4f5d71636dab4ce96adfa04eb1cb8d336823ebcdb6c'
    },
    {
        privateKey: '9d143623b943d52c7d10762ea630cd18d49628af33531a77e776341216d7d1a0d9ad78c207477bce5ac37726868e2d0029fcddfb2d4370bdf9cbee8c70e0e716',
        result: 'd02daf7eb02ad05fc2c15a7c28316630e3d3046310d45bdcab445d4f39357b7b'
    },
    {
        privateKey: '2446f0e98bfe94fd005ef480766783781a1e34447f3bdb41ba8e842cbccc0264dbad0659f244b22c9c025298f078920cafea1bfc56025f403fc45a2cdc75201f',
        result: '50b5cf8e0cde4e93aa4027bc3f84cd4487abdbf0d2391dbf292b9bb46a247978'
    },
    {
        privateKey: 'c790e45cd371d70ac34c5b35ac645337f53a5c9b674dada9a4efde9f84fafa7bddad3cb8b329bc156a1e1fa7d59c7aefa1f02b4e91183107b24e596e79f22696',
        result: '10201c849f06c2d32ab66ba99ac289b1ea5d8ce393260074025c98857716ef49'
    },
    {
        privateKey: 'eaadcd554ac9bd711d4e15957b58a7803ba84b50d533c52820fa55ef56600a37dfad3579c46fa985c1b4cdcf60470fed5ff93df4d83cbbb31d20f42fed13390f',
        result: 'e0cea6a5f5e8fa31ca1678e25f2a548fb5d89342eb9e3d93be53c6111d6f5575'
    },
    {
        privateKey: '581154948dc2ce37e94bf8192fcb179f1bec13f73f8630598ae8ca5bba66d9a3e1ad5fdf5d2567726df0faa3dc30186dcdbc674775f44d5856e1e9ecfdc9ae20',
        result: '78b413bb75b5ae7fd73c82e404e40b50ba2ff2843ebdd6027d4feef9d7c6be42'
    },
    {
        privateKey: '31646cc4b644b93bc6e462adb47b6b6bc5d25ea87f06c78412fabb6aef7cb5fbe3ad5add568541797929062fb6036fe185274aec9d5aeceaea549146762d2700',
        result: 'e8cac1e8e1705a351d9111e6ff92f737956398db8c786a18147094afd42bde42'
    },
    {
        privateKey: 'f548904264d53673cdaf67366bf1a3ec7fdd4c60c90129c171d0bad88a06f1b2e5ad2f81bed510bfd9c90bb44fbd32d9a3199ab1d21159cc5d626496925d3c3f',
        result: 'a06cdbbc75643b1457966bc3423a6d4ee5ec0ffcc4359d0f73d8e9d79e0f1368'
    },
    {
        privateKey: 'd1190d3202b6998d38fd0c42d963312f319634a8ab6c54ebd2d0565165e01c3fe7ad4166a8b366c32658b9259e0f12de3fb1ab016835b237e330ba0f13521250',
        result: '388cd2101daab4c434ecee77464420d0d6245fc7dab6bee2ea8bcfedf750ac68'
    },
    {
        privateKey: '119298b27a4a2816477b3b90c5211a999feb0ca688e1e07e6be1de3fbfb782bfe9ad21c8c63511e10b08ac02b646ae8c59cbadcded8d2ebffd04e4d250100d81',
        result: 'f89c3618523f48d79068dcd7f3d86e50297e0ceab4eb35d3b13d0550e3d7996e'
    },
    {
        privateKey: '172b1f57346744d051dcd52b4d2da9452cb231d8ad25af67dbda37b4b02af60aebad3cc9a2f95b81deec392ce5ba70d622e2e5eda82e19baf4b6f75abc162d0d',
        result: '30c0f854bfa61cf9cd5dab12159dc124976778476260f06f603b5f414b834e52'
    },
    {
        privateKey: '7a3fb8548a97fae54fb93e476759b002f6fae2ef9ae9382cdf364679f300175eedad7c8736544f7e6e6ecfe01c7819a5bc752b21b165a654847a10489a39e029',
        result: 'a0bd616f543a1a15a45b945aee683bfeb17da3367836aaa51b54286f33de3570'
    },
    {
        privateKey: '7b0cac1fb5c37664b9656f61fbd45755191ea0fdd49712b5ec9a616aaadfd4e2efad6502650dcdcac1406f6f7e0c28c062626e1a374faa99a75c5a8d33106a57',
        result: '000f52d6ea0f6fbb666615d8c436752a8228d6d3bacfc3b8dc39d8e1bbfcab49'
    },
    {
        privateKey: '7886f56457289303fd99b3f9cc2b3e83735abd2a4ca452284bb6d8698f68a617f1ad1fc62e23a1e5d050f707242e5fa29b7de9c4e1ce2b6ca7c1bc1abe5f796c',
        result: 'f8344e5382e4b50cfd9b12bc91c29a11bf5d41548a59511ef70c58a9b334e357'
    },
    {
        privateKey: 'c1d558f4025a0b33c412605dbad180a38448da2fc07a403cc158d8a4dfaf5839f3ad16260e045a70e7b644745b37475d34cfab5c5eebed25d40fc7309490e302',
        result: 'e0a4ca7a6e7ed7bb1fb056dc69b63e851fcd01beec2a01024d4520decdea255b'
    },
    {
        privateKey: 'cb55a698d43b75fe3effcddf611d9763809e2c25fc7b0d877db3c28d578af9cbc00d6bf8a9a6ac67489e0823422c7f239e5da089ab450f628bb0250f5165e1d0',
        result: '08f990478c1e096521dd5a7418f857b5515d54225c6b3fc43c8058f1f7e97153'
    },
    {
        privateKey: 'cfb5ae3a1bef40d3b73280f07a19cd63033bfb191f3e3f8ea160b2c14e697c50c01d68c6cc25b57c73aa0870f7a9966a104e5ad592681c5a13dca65a4358d7aa',
        result: 'a8688bb787544576e7803967fda57f9c3bd7711771c041d400a42da7df317775'
    },
    {
        privateKey: '30f1b022f798abb3cb766b85c75c939d9e9016e795c37b044da83dd700bdf178c02d68ec66a4f347f6ce89ffc4cb43c33cb3cd8ed0072caa64e06bd70b171367',
        result: '88d1f2ebb2423e947caf3de401882272a2b0de826fc9d49b18889be990e73e47'
    },
    {
        privateKey: '8a5b10f7e992f57669e2dd395b3918dea76f595d4806bb09ec6c65a36cab9c27c03d686257718cf569bad81c19a9b841f402798627dd689db4e0e6c6cf23eaa8',
        result: '185f9ce2c581b86025dbe2fea79c8a520d9c0979bfa2402a2f6c380cec1ae57c'
    },
    {
        privateKey: '166a17d93acd038046b5057eca76bb6ae8c6793ca668d0dc35f6a786adb32755c04d697f2a7887ad4938f1b991463ef19bfef9e6d36546ef22abf10d2968e401',
        result: 'e07d6af49b8a8e62728b9141d4a5804da2ad29df8d73b3062a855fc941eaba66'
    },
    {
        privateKey: '1dc86840bcc6f95977dee229164d374d03e6ca8eb73d4de012d71949e899a856c05d6a15bd6640e0c867d2a8b976384195819a7c687bd8b3316868dcf4a480e7',
        result: '58647475f82b1547a698307a43bea96bd071453d81d5942b426dd9a044f9c86d'
    },
    {
        privateKey: 'a2f0494822a1896a6bc9dcdba8e95bc7298bded5f03265188439a825597aa4c6c06d6b2bb53e1320157fb03707187746d25a8d97a7db0573b75231ab5770cad2',
        result: '981fbfeeac220f050eddbbbf710b330cf57d6fdd994713b9acc559c6fa440d53'
    },
    {
        privateKey: '284247a7e606d1dbff0e689b90458557f28dc773afec7782d0cbf6ac77f85da3c07d6aa6b39fc3330b9314409001622a306260a17145d9da88d19c9d3dc26440',
        result: '80ccc5801701d62bdb4b9d31eae591198739c212031365d176ff0ed04f95da78'
    },
    {
        privateKey: '372ed3951a24584d3f2c9242ba7e505d91a4350233855d4f7fff6f573800c098c08d694a7f73a95ca583e4915635ef8eb2f7533ec746e73dbddccd4008eccec9',
        result: '589be63793d6d7a4d4b42b343e71a3bfd66824960a61c0f8150bff1bfd156e72'
    },
    {
        privateKey: '87e10da13996a17fde694ae1940963e311e32a5e046b56b57cfd18d927ebb925c09d6ab3e053e7254368a1065c737f03cba948518a51107202147d17fab3cfde',
        result: '406c368f455f1e609eaccfc213f2b6ed5f5cb281dd2fe0d084c18f680c140967'
    },
    {
        privateKey: '916f9f0097eaae7971ece7b783f04afe3c38a8ed63153978d34db8297b7b81c9c0ad681aadda50635777155185c7f7faa60dd2d823bb1c28fc12fa8a78089dc0',
        result: 'b89a66bf4f8373eedfcf71a70127e3a0986a6994f3cbfc64c423f43669f2ae4e'
    },
    {
        privateKey: 'f06f507f2540dbaebe180817afa854d15d500da8e54f227160f3ef91f7d17263c0bd6b652781c1da3ef914f42c6bfa51561186194ac2394f5121f2c977ded12c',
        result: '501d7db0205357b74e651fb440132a824dc9698673327b0efc5bad9deb0de075'
    },
    {
        privateKey: '076867e02a026909e7453ae82b58b1527a7257df2d384632298a22e1652651cfc0cd68d5c3cdc83da0a0afc528291f54cb6c9156e3fa80782f6ee54cb4572651',
        result: 'f8243f1bb4929c6044223f81d363114d06f3b912d8da066d6b9f248d7c7d7055'
    },
    {
        privateKey: 'd60d49842414988e1f4b69a5fb7eb8e1bc3881c7a7ed34e148134262639bdc8dc0dd6b4c7230aa044ffb3c31124242dfd7f80ab3813392edf399b74defa4333a',
        result: '5043ce312451093773208cd52181ca6683b22f5742a5fb080f963f0ec91c7f44'
    },
    {
        privateKey: '54cd00f9d779aa508fccaef9da20a0844eeb7acfcf245bb65b5a32df490986b3c0ed6ab370294f09170f44150c3c6cfe366a87d0c4cebfd15a3e4b9ceb2bacbe',
        result: '80d6a81de1ff9c9e1d09cb3314f2279f3c6410c6104711c0827c2be9f20d7548'
    },
    {
        privateKey: 'b35e10948b5405bd758650d5fdf49cfdc717d2966bbb83a9634f7c3b32120742c0fd6b51952769fa36edd2d51b5eac20648e841619e6e61fcc96e7d498b29c49',
        result: '38db6ea68aa4cf7afff14d2e53aaa86cebe7c5e62aef7984d191e0fe34a82171'
    },
    {
        privateKey: '04d4ba82fb9ddfd0de2aaec1653dc4b5458befb8071b2974784c5840132b18c1c10d68f818772176bf18776874700e2eee83a9ac562eceb552b24d8f41919470',
        result: 'd8eb1ebe41d3565864326cf3a76c3e866c3f265e10a8c1e0faee10b015548666'
    },
    {
        privateKey: 'a86ec0693eaa07d4b81fcb6ffabdec151c7ec28a0dc00cafe2b70276eead728fc11d6b94bfc5103ee29cb8cbaa5c6de2acdd1b279e52773537386792861f8f36',
        result: '801f8f8cfab5ba0a264f06d0b17dd1f2aeb7f61cbd5008b6f4d6e4bab1801369'
    },
    {
        privateKey: '8ff82618ab72f4d71283ed1be4a82e52389fed57d2992f307c67e9db6e979d4ac12d6a35138791337821c6114b6e83d4e5c55192421cd6c9c5af7809e1014e67',
        result: '10db7ef34b9750def225d1a8f232fd06fe23dc959ee64ecb9b4dfc996f94eb6a'
    },
    {
        privateKey: '010a49175f9f46f738991d556a21111202b1e4b4176e2cea858019668df75311c13d6a01fc72016e1a2dfbe48a6a2632765e99d06797a9414d4e46b28000c1d6',
        result: '6808259fb13f22329444a2c0f7e2b7201519fa9684b53b81df86b39e5250bd44'
    },
    {
        privateKey: 'a53c30f3b7d3be56b97d8c1e2ee2f12c7b80df63fce8ee71d5dd7f6e51339f1bc14d69ae398eabe5b9e17daf0e2d27203243cb267b55832b11f3bdbe65b0c99a',
        result: '604676f76a940223d346f2c97f1d538b9d4a51112fec609ab1c58c4bfccfdf44'
    },
    {
        privateKey: '4edb90052df42ac3d9d603ca9bbf17d629b2032ec0a1ccc9bfa153f71040008ec15d698abec937f63da8e3bdc7deff975db0bebc3d0807c63646097e650e00d6',
        result: '703e205821c483d3836baf01b2067a0e7dce1ebd29d1bd436f6249d11e311279'
    },
    {
        privateKey: '36f6dcd5e2b03402c73bca5784de2a7ab81f6677d8fc7d5a0f7c37968be7825ec16d68a2bd0c22182053312b96592d4e2a0b0e1b28eed4accc84364ed9c94ca5',
        result: '50348dd4c558719094bbfed19935965aeabd756dd45d838176a3ac0142bb0a6c'
    },
    {
        privateKey: 'fceafecf3dfae5c3b7069bf3ac066feb4ab6bfd2108a1c8d909fe461ea1e18d5c17d68105b3267273796b66b6ea10ff84d87077029a3010de0e1a23755de053b',
        result: 'e071c6975e01c1eb39cdab151945e28c62fbe312257722737ab0fe2da8d7ce42'
    }
];

describe ('Test crypto_sign', () =>
{
    it ('Test crypto_sign_ed25519_sk_to_curve25519', () =>
    {
        sample_crypto_sign_ed25519_sk_to_curve25519.forEach((elem) =>
        {
            let privateKey = Buffer.from(elem.privateKey, "hex");
            let x25519 = Buffer.from(crypto_sign_ed25519_sk_to_curve25519(privateKey));
            assert.deepStrictEqual(Buffer.from(x25519).toString("hex"), elem.result);
        });
    });
});
