/*******************************************************************************

 Test for TweetNaCl

 Copyright:
 Copyright (c) 2020 BOS Platform Foundation Korea
 All rights reserved.

 License:
 MIT License. See LICENSE for details.

 *******************************************************************************/

import * as sdk from '../lib';

import * as assert from 'assert';

describe ('Crypto', () =>
{
    let seeds: Array<string> =
        [
            "SCSRW54L4EXJYTQIQYCJD4YLBMDALRBMHSSSZR4VW5PSBZZ2YII2RRQN",
            "SCU5ULJPL72SCEWSF7W4UBG2ZKP3NAZF4XBLTICACPJMFMIRZOKAICPM",
            "SBQSOIZ6CUOZI5RUKAGBQJ32LI3WWXYO2GLYIXLWWZGX5Y3TW45NBRKO",
            "SAK5CDK243IOTSESCOYVQITMCFQHMKVU75OFVJ5MIRR7Z2FNHTN5MV2P",
            "SB3XDHT7PMSUYEL34FXF4X3BTKMSNPUKKVYADEYF36LKMGIJBLBQRSH3",
            "SC76SLQCYGM6ULQH3RFTIEOM6MAMHEWLMFJ4EYRMO672ZRFFWIRHP2MJ",
            "SA7DBIL3APKZ3SUPILROUICS5OD54IFYQXQQ6UHA3L7E5FPIXXSKK4BQ",
            "SBTAQ3LWMSL6PQJFZGJQOCSS5HL7ZDJW6DJRL7NYJONVBNFRBXYXQJ4C",
            "SC4GSAMNE542MK4S4JCYWR6IUZ3W7QSOZLWIZZ52RST4DWN2OIZWZFZU",
            "SAXSVOLPN2GTNPS7LAFJIXEPW74VX4ZGQY3STOWKX4BOSZ3IZY6VLMSQ",
            "SCSFBLXNP5SKL3JT2TFPGXQ7TQQWQKTY5EPPBL37CS4YXHVS2FXFM6GN",
            "SDYSEVNAPWT4NBY6JXMIHQDIAPRU6YYQ4EFPMSQGMHZERF5YIKJPYDI2",
            "SCORINRDXFB5KLD5CB3C5JRQZUMNJFRIV4ZVGGTX453DIEQW27I2BPDD",
            "SASEN4HJRP7JJ7IAL32IA5THQN4BUHRUIR7TXW2BXKHIILF4ZQBGIZSL",
            "SDDZBZC42NY5OCWDJRNTLLDEKM37KOS4TNTU3LNJUTX55H4E7L5HWVUD",
            "SDVK3TKVJLE324I5JYKZK62YU6ADXKCLKDKTHRJIED5FL32WMAFDPDXZ",
            "SBMBCVEURXBM4N7JJP4BSL6LC6PRX3AT647YMMCZRLUMUW52M3M2H4ZU",
            "SAYWI3GEWZCLSO6G4RRK3ND3NNV4LUS6VB7QNR4ECL5LW2XPPS27XIDA",
            "SD2URECCMTKTM46NV5TTM27RUPWH7XKMMDEQCKOBOHILVWEKA3Y3E2ZE",
            "SDIRSDJSAK3JTDJY7UGEFWLDGEXTDFRUVCVWYVHL2LIFMULF4AOD7VZA",
            "SAIZFGFSPJFCQFSHPM5ZBRJBDKMZ72YMU2EODYD6NPQ54P57W6BL6E2V",
            "SALSWH2XGRTUJUCR3TKSWTJNVFCSZMRR3CWSLL3H3PNDPNFQFL3AUVJV",
            "SB5D7OCURKL7VZKPXE7EOZ2ZWABPN6XC56NOSOBM343EM6PTAALV5O75",
            "SB5QZLA7WXBXMZFZMVXWD66UK5KRSHVA7XKJOEVV5SNGC2VK37KOFKQO",
            "SB4IN5LEK4UJGA75TGZ7TTBLH2BXGWV5FJGKIURIJO3NQ2MPNCTBPHGB",
            "SDA5KWHUAJNAWM6ECJQF3OWRQCRYISG2F7AHUQB4YFMNRJG7V5MDSE3J",
            "SDFVLJUY2Q5XL7R677G56YI5S5RYBHRMEX6HWDMHPWZ4FDKXRL44X4IC",
            "SDH3LLR2DPXUBU5XGKAPA6QZZVRQGO73DEPT4P4OUFQLFQKONF6FAVKL",
            "SAYPDMBC66MKXM6LOZVYLR24SOOZ5EAW46K4G6YEJWUD3VYAXXYXQVX4",
            "SCFFWEHX5GJPK5TJ4LOTSWZZDDPKO32ZLVEANOYJ5RWGLI3MVOOCP765",
            "SALGUF6ZHLGQHACGWUCX5STWXNVORRTZHSTGRUG4GX3KPBVNWMTVK4RM",
            "SAO4Q2CAXTDPSWLX33RCSFSNG5GQHZWKR23T2TPACLLRSSPITGUFNRXR",
            "SCRPASKIEKQYS2TLZHONXKHJLPDSTC662XYDEZIYQQ42QJKZPKSMMTAF",
            "SAUEER5H4YDNDW77BZUJXECFQVL7FDOHOOX6Y54C2DF7NLDX7BO2HFSW",
            "SA3S5U4VDISFQTJ7FSJEFOT6KBOZDJBVAIZYKXKPP77W6VZYADAJRVIE",
            "SCD6CDNBHGLKC766NFFODFAJMPRRDYZKLYCGWVVVPT6RRWJH5O4SLLL2",
            "SCIW7HYAS7VK46LR5TT3PA7QJL7DYOFI5VRRKOLY2NG3QKL3POA4SBLG",
            "SDYG6UD7EVANXLV6DAEBPL5IKTIV2UANVDSU6ITRMDZ67EPX2FZGH5VW",
            "SADWQZ7AFIBGSCPHIU5OQK2YWFJHU4SX34WTQRRSFGFCFYLFEZI472Z6",
            "SDLA2SMEEQKJRDQ7JNU2L636XDQ3YOEBY6T62NHBJAJUEYTDTPOI3IS2",
            "SBKM2AHZ2542UUEPZSXPTWRAUCCE5232Z7HSIW5WLNNDFX2JBGDLGSHV",
            "SCZV4EEURNKALPLVQZINL7PUTT64OF6SSZV3XA5JMNHXYOZSCIDUEIIH",
            "SACNJOUC7OO57UG6FKXMCZJ5YS2ULC7PXADRWKLUPBGFQQATFMMMCBAM",
            "SCUG5QDJH2VAPVFYD7FW76V55QKRY7WCRIG4ADFP4K3QE5XOVVZI7KBP",
            "SCH7QJQYVNZPJVYSQPWRXZFIFZJDRH7NK7JJSLZQPRT6TW3OS6OUUJON",
            "SAAQUSIXL6PUN5ZYTEOVK2RBCEJAFMPEWQLW4LHKQWABSZUN65JRDWEY",
            "SCSTYMHTW7J34VVZPWGB4LXC6EWHXAG7MP6OR3TR2XOX63SRGOPRXCJL",
            "SBHNXEAFFX2CVQ6Z2YB4VG57C7LCTMQDF3AKDTGJX6QVH5YQIAAI5QNH",
            "SA3PNXGV4KYDIAWHHPFFPBG6FJ5LQH3GO7MPY7K2B56DPFUL46BF57BH",
            "SD6OV7WPHX5OLQ5XA2N7HLAGN7VUVNV72IIIUHENSCP6IYPKDYMNKMAX",
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

    let sample_crypto_sign_ed25519_sk_to_curve25519 =
    [
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

    let sample_random = [
        {
            random: 'd2ff19567cc66105ce550112c84750f23c94c36fba7d9d95f1311e5fe1e34f86'
        },
        {
            random: 'df6a4ad6b420a240aef0e0d7a592eb9ea7f3ee3e16d1d9b5ae130cf9151356e9'
        },
        {
            random: 'c9eead97c360cbeae8f3dbceaad35672050838f3b40dad34349bb5a94570d192'
        },
        {
            random: 'f0084a74658529855116c9e0a4f830ba3267e0d5ff4a879b39e281b85c1ad2aa'
        },
        {
            random: '76c178bdecebae2d68bc6e5265c13de712545543d96a510e4a3c5428ec2a1482'
        },
        {
            random: 'a6b3a94e60a052d85735f98d00f56ef8e92b850f8492bc2bc9b47e2c01525f25'
        },
        {
            random: '35800c9d96a83e831d2c9192987ad9680bd86e122589eacbd2009becf2a8d3e0'
        },
        {
            random: 'e84adcc3d7201c29ced3da4eacb865bfcebe522beb08b83d60c14fb764802f7e'
        },
        {
            random: '30b713cc9f72b4b370d115b9745b7c65bc6d0fffc89e5b2c446c41a9303049ec'
        },
        {
            random: '2fd1d126c99f5c785400cc689a082bba6f871b7d8df3d3afa820fcf778eb74a3'
        },
        {
            random: 'fda59e4dab4c466bb6d8b807dd6e9a3da941dfa0f435803cc03a141b1d5588fd'
        },
        {
            random: '54eb3cd621b63fc752dfe1af358907f07b2b21ddc97d24c577cae1b58ddd6350'
        },
        {
            random: '95346fc646da1550fc69777a39fc45131fe08f5ec94c041eeadc7a2805b940f8'
        },
        {
            random: '237c76c39d16c97cdfb695aa1ccbb295fa265b6c456c2db94fc45afbfb12b229'
        },
        {
            random: '6620e76b60c3928481dc7175df3c75f5a7d05b200aade5b231c27f6078b3fd77'
        },
        {
            random: '43eeeafb970319ddaf2ff20be3e4f7e5050b3c467aca2be13b30131e9ebc474e'
        },
        {
            random: '2895c2f015934ea4c358dbd607bd331ad9ac32946bd69cf2e34e6b571337470c'
        },
        {
            random: '1c2b0df25c150daa97cf8ae69be839a9b0990bd1da06dfc4e33b7a5d556166f3'
        },
        {
            random: '202011c9b118d2b929dfef949bff0df92723ed1d6bfd1136810a62feecdbcabf'
        },
        {
            random: '55811dc82f8c77ca6f38f267f4b2e95fe8cf3d5071219fe93631d367cbfc17c7'
        },
        {
            random: 'c1b0e0de4b5cdda6339c4147f5cec2ffb571788bb5696646ca3001119385bd29'
        },
        {
            random: '705f8af67c898e08f04159fa58c9a2d6e072e04e3f639ac18d7b8475d8b3c2b8'
        },
        {
            random: 'd20cfc6712cfc8897e5cc9cbcea7189cca239b378d39fed4be2d3603fbf68d2c'
        },
        {
            random: 'e55201002d8ed82ebd464b7cf8470553d13ba8294eef0361e7a9e668eb8ba1f1'
        },
        {
            random: '8bf3295ac7ef0c70bf225d5cbf3d7d139383a453d270ce1260d4c611d91ffe48'
        },
        {
            random: '44674ef637609feea1ce7c3c89a6e9fd966fdf9b11121ff268619b79e1b4d2da'
        },
        {
            random: '09e138099c7fa194c6b0b88de00e4f7a56b0de63da97914f47d07ac8c73bdca5'
        },
        {
            random: 'f9b51f66306770852d3d4475f59bbb2388676f987111a5c540325af24a02a38c'
        },
        {
            random: 'bfee24e9018789674a045047824b2ae1dba1b0729b0c70a4c98ed76df7c38b32'
        },
        {
            random: '8920b73837967faaa3e00f1fefadd767ef3cd3f351dc0073a8ce0456b4171b37'
        },
        {
            random: '3bd9a36db7c27d8d08d458cfd7cdffe6fdfa813e4f0b050e75019ef04b6f0beb'
        },
        {
            random: 'e78294d5f39e860fdad2a4467fd337ff6f6eba1230c8de25636f18c5b6dedecb'
        },
        {
            random: '01e318f9e1130d90e12cad95319d86210f385d8441fd2f37aed8b810650385c2'
        },
        {
            random: '952194460b6a35e6c7aba7669640db400a8d28ddc39da827eb198c69cd30ac23'
        },
        {
            random: 'dede1444241322c2182859d96abab820ea864b33f50b8345520a82cac6023e71'
        },
        {
            random: '36050867488614f4c0759824e2be3f1462c41dc037e3241a4b99dba96ebf234e'
        },
        {
            random: '94e7539ed5cff3ed1620290ecaf0f7eb7cc81edb54c0c16fedd2c32948f84e34'
        },
        {
            random: '9da0c8922013eaf0d9b8faa441c0e42ca37adcc02e879aa2deab467852293ee1'
        },
        {
            random: 'a06ec798af844cdc0494c92f10efbe3ea9153e075311e350d9bfd6cc4785ee1c'
        },
        {
            random: '546854210116a81993dbb5c0ba7c9f533be7594ef73382a776ff41fcac9544ee'
        },
        {
            random: '747bbfcef851edf18d126f4773db9e5603c2d181fddd946e15ce5bc4c97c6419'
        },
        {
            random: '7b9c6b117dfacf958e91ce55c8ecdb5a8a05733ca9b1368a0d627ae3837c7dbb'
        },
        {
            random: 'c6914414dd5c509726e9486074599b199b3b5bf50b07efc7818a65628fe60568'
        },
        {
            random: 'ebf21643d660cdcc480927299ac15b5d731c9b0b34e3a36a93f9f9d1e0131287'
        },
        {
            random: '319f4408e7f595ec25cf09089c67b0928ab21e094060cb825e4394b7c1dd9f4d'
        },
        {
            random: 'e60dda3f8f51770f3ccffd4b279f31fc04bcea448dc4085c118978908d72508c'
        },
        {
            random: '031baf348ddfcb7751df47c490107dc33d3d667c7657fa7836eb217ed6391881'
        },
        {
            random: '804bd022072e8e89d80ef2dd71f835b22b81a94a04499d22730aeb1d9317cd39'
        },
        {
            random: '6aa76c2fab061652f68195f0d1109688bd285a4b2b1e091e2175cb00fd530ecf'
        },
        {
            random: 'a3409fc126a49491a901a6a2a21e599421d611ac98e0c537e1d4901203ba9b37'
        }
    ];

    before('Wait for the package libsodium to finish loading', () =>
    {
        return sdk.SodiumHelper.init();
    });

    it ('Make Sample Data', () =>
    {
        let values:Array<any> = [];
        seeds.forEach((str) => {
            let seed = new sdk.Seed(str);
            let hash = sdk.SodiumHelper.sodium.crypto_generichash(64, seed.data);
            let reduced = sdk.SodiumHelper.sodium.crypto_core_ed25519_scalar_reduce(hash);

            values.push(
                {
                    hash: Buffer.from(hash).toString("hex"),
                    result: Buffer.from(reduced).toString("hex")
                }
            );
        });
        //console.log(values);
    });

    it ('Test crypto_core_ed25519_scalar_reduce of libSodium', () =>
    {
        sample_for_crypto_core_ed25519_scalar_reduce.forEach((elem) => {
            let hash = Buffer.from(elem.hash, "hex");
            let result = sdk.SodiumHelper.sodium.crypto_core_ed25519_scalar_reduce(hash);
            assert.deepStrictEqual(Buffer.from(result).toString("hex"), elem.result);
        });
    });

    it ('Test crypto_core_ed25519_scalar_reduce of SDK', () =>
    {
        sample_for_crypto_core_ed25519_scalar_reduce.forEach((elem) => {
            let hash = Buffer.from(elem.hash, "hex");
            let result = sdk.crypto_core_ed25519_scalar_reduce(hash);
            assert.deepStrictEqual(Buffer.from(result).toString("hex"), elem.result);
        });
    });

    it ('Make Sample Data2', () =>
    {
        let values:Array<any> = [];
        seeds.forEach((str) => {
            let seed = new sdk.Seed(str);
            let kp_sodium = sdk.SodiumHelper.sodium.crypto_sign_seed_keypair(seed.data);
            let x25519_sk_sodium = Buffer.from(sdk.SodiumHelper.sodium.crypto_sign_ed25519_sk_to_curve25519(kp_sodium.privateKey));

            values.push(
            {
                privateKey: Buffer.from(kp_sodium.privateKey).toString("hex"),
                result: Buffer.from(x25519_sk_sodium).toString("hex")
            }
            );
        });
        console.log(values);
    });

    it ('Test crypto_sign_ed25519_sk_to_curve25519 of libSodium', () =>
    {
        sample_crypto_sign_ed25519_sk_to_curve25519.forEach((elem) => {
            let privateKey = Buffer.from(elem.privateKey, "hex");
            let x25519 = Buffer.from(sdk.SodiumHelper.sodium.crypto_sign_ed25519_sk_to_curve25519(privateKey));
            assert.deepStrictEqual(Buffer.from(x25519).toString("hex"), elem.result);
        });
    });

    it ('Test crypto_sign_ed25519_sk_to_curve25519 of SDK', () =>
    {
        sample_crypto_sign_ed25519_sk_to_curve25519.forEach((elem) => {
            let privateKey = Buffer.from(elem.privateKey, "hex");
            let x25519 = Buffer.from(sdk.crypto_sign_ed25519_sk_to_curve25519(privateKey));
            assert.deepStrictEqual(Buffer.from(x25519).toString("hex"), elem.result);
        });
    });

    it ('Test of ED25519.Sum', () =>
    {
        let sum = sdk.JSBIUtils.Sum(
            [
                sdk.JSBI.BigInt(1),
                sdk.JSBI.BigInt(2)
            ]);

        assert.deepStrictEqual(sum, sdk.JSBI.BigInt(3));
    });

    it ('Test of Uint8Array', () =>
    {
        let x0 = 0;
        let x1 = 1;
        let x2 = 2;
        let x3 = 3;

        let b = Buffer.alloc(4);
        b.writeInt32LE(-x0);
        console.log(b.toString("hex"));

        b = Buffer.alloc(4);
        b.writeInt32LE(-x1);
        console.log(b.toString("hex"));

        b = Buffer.alloc(4);
        b.writeInt32LE(-x2);
        console.log(b.toString("hex"));

        b = Buffer.alloc(4);
        b.writeInt32LE(-x3);
        console.log(b.toString("hex"));
    });

    it ('Make Sample Random Data', () =>
    {
        let values:Array<any> = [];
        for (let i = 0; i < 50; i++)
        {
            let r = sdk.randombytes_buf(sdk.ED25519Utils.crypto_core_ed25519_UNIFORMBYTES);
            values.push(
                {
                    random: Buffer.from(r).toString("hex"),
                }
            );
        }
        console.log(values);
    });

    it ('Test crypto_core_ed25519_from_uniform', () =>
    {
        //sample_random.forEach((elem) => {
            let random = Buffer.from(sample_random[0].random, "hex");
            let r1 = Buffer.from(sdk.SodiumHelper.sodium.crypto_core_ed25519_from_uniform(random));
            let r2 = Buffer.from(sdk.crypto_core_ed25519_from_uniform(random));
            assert.deepStrictEqual(r1, r2);
        //});
    });

    it ('Test FE25519', () =>
    {
        //console.log(sdk.FE25519.ed25519_A);

        let one = new sdk.FE25519();
        let two = new sdk.FE25519();
        let one_1 = new sdk.FE25519();
        let neg_one = new sdk.FE25519();
        let sq_neg_one = new sdk.FE25519();
        sdk.fe25519_1(one);
        sdk.fe25519_add(two, one, one);
        sdk.fe25519_sub(one_1, two, one);
        sdk.fe25519_neg(neg_one, one);
        sdk.fe25519_sq(sq_neg_one, two);
        //console.log(sdk.FE25519.fe25519_sqrtm1);
        console.log(one_1);
        console.log(two);
        console.log(sq_neg_one);

    });

    it ('Test ed25519_sqdmone', () =>
    {
        let one = new sdk.FE25519();
        let mone = new sdk.FE25519();
        let dmone = new sdk.FE25519();
        let sqdmone = new sdk.FE25519();
        let temp = new sdk.FE25519();
        sdk.fe25519_1(one);
        sdk.fe25519_neg(mone, one);
        sdk.fe25519_sub(dmone, sdk.FE25519.ed25519_d, one);
        sdk.fe25519_sq(sqdmone, dmone);
        assert.deepStrictEqual(sqdmone, sdk.FE25519.ed25519_sqdmone);

        sdk.fe25519_mul(sqdmone, dmone, dmone);
        assert.deepStrictEqual(sqdmone, sdk.FE25519.ed25519_sqdmone);

        sdk.fe25519_mul(temp, sdk.FE25519.fe25519_sqrtm1, sdk.FE25519.fe25519_sqrtm1);
        assert.deepStrictEqual(temp, mone);

        sdk.fe25519_mul32(temp, sdk.FE25519.ed25519_d, 2);
        assert.deepStrictEqual(temp, sdk.FE25519.ed25519_d2);

        sdk.fe25519_sqrt(temp, mone);
        assert.deepStrictEqual(temp, sdk.FE25519.fe25519_sqrtm1);

        let temp1 = new sdk.FE25519();
        let temp2 = new sdk.FE25519();
        sdk.fe25519_sq(temp1, sdk.FE25519.ed25519_d);
        sdk.fe25519_mul32(temp1, temp1, 2);
        sdk.fe25519_sq2(temp2, sdk.FE25519.ed25519_d);
        assert.deepStrictEqual(temp1, temp2);
    })
});
