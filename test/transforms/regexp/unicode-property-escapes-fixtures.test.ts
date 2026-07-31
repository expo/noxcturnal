import { runFixtures, type FixtureCase } from '../fixture';

const expectedOutputs = [
  'var regex = /[\\u{14400}-\\u{14646}]/u;',
  "// Surrogate code points\nexpect(\n  /[\\u0378-\\u0379\\u0380-\\u0383\\u038B\\u038D\\u03A2\\u0530\\u0557-\\u0558\\u058B-\\u058C\\u0590\\u05C8-\\u05CF\\u05EB-\\u05EE\\u05F5-\\u05FF\\u070E\\u074B-\\u074C\\u07B2-\\u07BF\\u07FB-\\u07FC\\u082E-\\u082F\\u083F\\u085C-\\u085D\\u085F\\u086B-\\u086F\\u0892-\\u0896\\u0984\\u098D-\\u098E\\u0991-\\u0992\\u09A9\\u09B1\\u09B3-\\u09B5\\u09BA-\\u09BB\\u09C5-\\u09C6\\u09C9-\\u09CA\\u09CF-\\u09D6\\u09D8-\\u09DB\\u09DE\\u09E4-\\u09E5\\u09FF-\\u0A00\\u0A04\\u0A0B-\\u0A0E\\u0A11-\\u0A12\\u0A29\\u0A31\\u0A34\\u0A37\\u0A3A-\\u0A3B\\u0A3D\\u0A43-\\u0A46\\u0A49-\\u0A4A\\u0A4E-\\u0A50\\u0A52-\\u0A58\\u0A5D\\u0A5F-\\u0A65\\u0A77-\\u0A80\\u0A84\\u0A8E\\u0A92\\u0AA9\\u0AB1\\u0AB4\\u0ABA-\\u0ABB\\u0AC6\\u0ACA\\u0ACE-\\u0ACF\\u0AD1-\\u0ADF\\u0AE4-\\u0AE5\\u0AF2-\\u0AF8\\u0B00\\u0B04\\u0B0D-\\u0B0E\\u0B11-\\u0B12\\u0B29\\u0B31\\u0B34\\u0B3A-\\u0B3B\\u0B45-\\u0B46\\u0B49-\\u0B4A\\u0B4E-\\u0B54\\u0B58-\\u0B5B\\u0B5E\\u0B64-\\u0B65\\u0B78-\\u0B81\\u0B84\\u0B8B-\\u0B8D\\u0B91\\u0B96-\\u0B98\\u0B9B\\u0B9D\\u0BA0-\\u0BA2\\u0BA5-\\u0BA7\\u0BAB-\\u0BAD\\u0BBA-\\u0BBD\\u0BC3-\\u0BC5\\u0BC9\\u0BCE-\\u0BCF\\u0BD1-\\u0BD6\\u0BD8-\\u0BE5\\u0BFB-\\u0BFF\\u0C0D\\u0C11\\u0C29\\u0C3A-\\u0C3B\\u0C45\\u0C49\\u0C4E-\\u0C54\\u0C57\\u0C5B\\u0C5E-\\u0C5F\\u0C64-\\u0C65\\u0C70-\\u0C76\\u0C8D\\u0C91\\u0CA9\\u0CB4\\u0CBA-\\u0CBB\\u0CC5\\u0CC9\\u0CCE-\\u0CD4\\u0CD7-\\u0CDB\\u0CDF\\u0CE4-\\u0CE5\\u0CF0\\u0CF4-\\u0CFF\\u0D0D\\u0D11\\u0D45\\u0D49\\u0D50-\\u0D53\\u0D64-\\u0D65\\u0D80\\u0D84\\u0D97-\\u0D99\\u0DB2\\u0DBC\\u0DBE-\\u0DBF\\u0DC7-\\u0DC9\\u0DCB-\\u0DCE\\u0DD5\\u0DD7\\u0DE0-\\u0DE5\\u0DF0-\\u0DF1\\u0DF5-\\u0E00\\u0E3B-\\u0E3E\\u0E5C-\\u0E80\\u0E83\\u0E85\\u0E8B\\u0EA4\\u0EA6\\u0EBE-\\u0EBF\\u0EC5\\u0EC7\\u0ECF\\u0EDA-\\u0EDB\\u0EE0-\\u0EFF\\u0F48\\u0F6D-\\u0F70\\u0F98\\u0FBD\\u0FCD\\u0FDB-\\u0FFF\\u10C6\\u10C8-\\u10CC\\u10CE-\\u10CF\\u1249\\u124E-\\u124F\\u1257\\u1259\\u125E-\\u125F\\u1289\\u128E-\\u128F\\u12B1\\u12B6-\\u12B7\\u12BF\\u12C1\\u12C6-\\u12C7\\u12D7\\u1311\\u1316-\\u1317\\u135B-\\u135C\\u137D-\\u137F\\u139A-\\u139F\\u13F6-\\u13F7\\u13FE-\\u13FF\\u169D-\\u169F\\u16F9-\\u16FF\\u1716-\\u171E\\u1737-\\u173F\\u1754-\\u175F\\u176D\\u1771\\u1774-\\u177F\\u17DE-\\u17DF\\u17EA-\\u17EF\\u17FA-\\u17FF\\u181A-\\u181F\\u1879-\\u187F\\u18AB-\\u18AF\\u18F6-\\u18FF\\u191F\\u192C-\\u192F\\u193C-\\u193F\\u1941-\\u1943\\u196E-\\u196F\\u1975-\\u197F\\u19AC-\\u19AF\\u19CA-\\u19CF\\u19DB-\\u19DD\\u1A1C-\\u1A1D\\u1A5F\\u1A7D-\\u1A7E\\u1A8A-\\u1A8F\\u1A9A-\\u1A9F\\u1AAE-\\u1AAF\\u1ADE-\\u1ADF\\u1AEC-\\u1AFF\\u1B4D\\u1BF4-\\u1BFB\\u1C38-\\u1C3A\\u1C4A-\\u1C4C\\u1C8B-\\u1C8F\\u1CBB-\\u1CBC\\u1CC8-\\u1CCF\\u1CFB-\\u1CFF\\u1F16-\\u1F17\\u1F1E-\\u1F1F\\u1F46-\\u1F47\\u1F4E-\\u1F4F\\u1F58\\u1F5A\\u1F5C\\u1F5E\\u1F7E-\\u1F7F\\u1FB5\\u1FC5\\u1FD4-\\u1FD5\\u1FDC\\u1FF0-\\u1FF1\\u1FF5\\u1FFF\\u2065\\u2072-\\u2073\\u208F\\u209D-\\u209F\\u20C2-\\u20CF\\u20F1-\\u20FF\\u218C-\\u218F\\u242A-\\u243F\\u244B-\\u245F\\u2B74-\\u2B75\\u2CF4-\\u2CF8\\u2D26\\u2D28-\\u2D2C\\u2D2E-\\u2D2F\\u2D68-\\u2D6E\\u2D71-\\u2D7E\\u2D97-\\u2D9F\\u2DA7\\u2DAF\\u2DB7\\u2DBF\\u2DC7\\u2DCF\\u2DD7\\u2DDF\\u2E5E-\\u2E7F\\u2E9A\\u2EF4-\\u2EFF\\u2FD6-\\u2FEF\\u3040\\u3097-\\u3098\\u3100-\\u3104\\u3130\\u318F\\u31E6-\\u31EE\\u321F\\uA48D-\\uA48F\\uA4C7-\\uA4CF\\uA62C-\\uA63F\\uA6F8-\\uA6FF\\uA7DD-\\uA7F0\\uA82D-\\uA82F\\uA83A-\\uA83F\\uA878-\\uA87F\\uA8C6-\\uA8CD\\uA8DA-\\uA8DF\\uA954-\\uA95E\\uA97D-\\uA97F\\uA9CE\\uA9DA-\\uA9DD\\uA9FF\\uAA37-\\uAA3F\\uAA4E-\\uAA4F\\uAA5A-\\uAA5B\\uAAC3-\\uAADA\\uAAF7-\\uAB00\\uAB07-\\uAB08\\uAB0F-\\uAB10\\uAB17-\\uAB1F\\uAB27\\uAB2F\\uAB6C-\\uAB6F\\uABEE-\\uABEF\\uABFA-\\uABFF\\uD7A4-\\uD7AF\\uD7C7-\\uD7CA\\uD7FC-\\uF8FF\\uFA6E-\\uFA6F\\uFADA-\\uFAFF\\uFB07-\\uFB12\\uFB18-\\uFB1C\\uFB37\\uFB3D\\uFB3F\\uFB42\\uFB45\\uFDD0-\\uFDEF\\uFE1A-\\uFE1F\\uFE53\\uFE67\\uFE6C-\\uFE6F\\uFE75\\uFEFD-\\uFEFE\\uFF00\\uFFBF-\\uFFC1\\uFFC8-\\uFFC9\\uFFD0-\\uFFD1\\uFFD8-\\uFFD9\\uFFDD-\\uFFDF\\uFFE7\\uFFEF-\\uFFF8\\uFFFE-\\uFFFF\\u{1000C}\\u{10027}\\u{1003B}\\u{1003E}\\u{1004E}-\\u{1004F}\\u{1005E}-\\u{1007F}\\u{100FB}-\\u{100FF}\\u{10103}-\\u{10106}\\u{10134}-\\u{10136}\\u{1018F}\\u{1019D}-\\u{1019F}\\u{101A1}-\\u{101CF}\\u{101FE}-\\u{1027F}\\u{1029D}-\\u{1029F}\\u{102D1}-\\u{102DF}\\u{102FC}-\\u{102FF}\\u{10324}-\\u{1032C}\\u{1034B}-\\u{1034F}\\u{1037B}-\\u{1037F}\\u{1039E}\\u{103C4}-\\u{103C7}\\u{103D6}-\\u{103FF}\\u{1049E}-\\u{1049F}\\u{104AA}-\\u{104AF}\\u{104D4}-\\u{104D7}\\u{104FC}-\\u{104FF}\\u{10528}-\\u{1052F}\\u{10564}-\\u{1056E}\\u{1057B}\\u{1058B}\\u{10593}\\u{10596}\\u{105A2}\\u{105B2}\\u{105BA}\\u{105BD}-\\u{105BF}\\u{105F4}-\\u{105FF}\\u{10737}-\\u{1073F}\\u{10756}-\\u{1075F}\\u{10768}-\\u{1077F}\\u{10786}\\u{107B1}\\u{107BB}-\\u{107FF}\\u{10806}-\\u{10807}\\u{10809}\\u{10836}\\u{10839}-\\u{1083B}\\u{1083D}-\\u{1083E}\\u{10856}\\u{1089F}-\\u{108A6}\\u{108B0}-\\u{108DF}\\u{108F3}\\u{108F6}-\\u{108FA}\\u{1091C}-\\u{1091E}\\u{1093A}-\\u{1093E}\\u{1095A}-\\u{1097F}\\u{109B8}-\\u{109BB}\\u{109D0}-\\u{109D1}\\u{10A04}\\u{10A07}-\\u{10A0B}\\u{10A14}\\u{10A18}\\u{10A36}-\\u{10A37}\\u{10A3B}-\\u{10A3E}\\u{10A49}-\\u{10A4F}\\u{10A59}-\\u{10A5F}\\u{10AA0}-\\u{10ABF}\\u{10AE7}-\\u{10AEA}\\u{10AF7}-\\u{10AFF}\\u{10B36}-\\u{10B38}\\u{10B56}-\\u{10B57}\\u{10B73}-\\u{10B77}\\u{10B92}-\\u{10B98}\\u{10B9D}-\\u{10BA8}\\u{10BB0}-\\u{10BFF}\\u{10C49}-\\u{10C7F}\\u{10CB3}-\\u{10CBF}\\u{10CF3}-\\u{10CF9}\\u{10D28}-\\u{10D2F}\\u{10D3A}-\\u{10D3F}\\u{10D66}-\\u{10D68}\\u{10D86}-\\u{10D8D}\\u{10D90}-\\u{10E5F}\\u{10E7F}\\u{10EAA}\\u{10EAE}-\\u{10EAF}\\u{10EB2}-\\u{10EC1}\\u{10EC8}-\\u{10ECF}\\u{10ED9}-\\u{10EF9}\\u{10F28}-\\u{10F2F}\\u{10F5A}-\\u{10F6F}\\u{10F8A}-\\u{10FAF}\\u{10FCC}-\\u{10FDF}\\u{10FF7}-\\u{10FFF}\\u{1104E}-\\u{11051}\\u{11076}-\\u{1107E}\\u{110C3}-\\u{110CC}\\u{110CE}-\\u{110CF}\\u{110E9}-\\u{110EF}\\u{110FA}-\\u{110FF}\\u{11135}\\u{11148}-\\u{1114F}\\u{11177}-\\u{1117F}\\u{111E0}\\u{111F5}-\\u{111FF}\\u{11212}\\u{11242}-\\u{1127F}\\u{11287}\\u{11289}\\u{1128E}\\u{1129E}\\u{112AA}-\\u{112AF}\\u{112EB}-\\u{112EF}\\u{112FA}-\\u{112FF}\\u{11304}\\u{1130D}-\\u{1130E}\\u{11311}-\\u{11312}\\u{11329}\\u{11331}\\u{11334}\\u{1133A}\\u{11345}-\\u{11346}\\u{11349}-\\u{1134A}\\u{1134E}-\\u{1134F}\\u{11351}-\\u{11356}\\u{11358}-\\u{1135C}\\u{11364}-\\u{11365}\\u{1136D}-\\u{1136F}\\u{11375}-\\u{1137F}\\u{1138A}\\u{1138C}-\\u{1138D}\\u{1138F}\\u{113B6}\\u{113C1}\\u{113C3}-\\u{113C4}\\u{113C6}\\u{113CB}\\u{113D6}\\u{113D9}-\\u{113E0}\\u{113E3}-\\u{113FF}\\u{1145C}\\u{11462}-\\u{1147F}\\u{114C8}-\\u{114CF}\\u{114DA}-\\u{1157F}\\u{115B6}-\\u{115B7}\\u{115DE}-\\u{115FF}\\u{11645}-\\u{1164F}\\u{1165A}-\\u{1165F}\\u{1166D}-\\u{1167F}\\u{116BA}-\\u{116BF}\\u{116CA}-\\u{116CF}\\u{116E4}-\\u{116FF}\\u{1171B}-\\u{1171C}\\u{1172C}-\\u{1172F}\\u{11747}-\\u{117FF}\\u{1183C}-\\u{1189F}\\u{118F3}-\\u{118FE}\\u{11907}-\\u{11908}\\u{1190A}-\\u{1190B}\\u{11914}\\u{11917}\\u{11936}\\u{11939}-\\u{1193A}\\u{11947}-\\u{1194F}\\u{1195A}-\\u{1199F}\\u{119A8}-\\u{119A9}\\u{119D8}-\\u{119D9}\\u{119E5}-\\u{119FF}\\u{11A48}-\\u{11A4F}\\u{11AA3}-\\u{11AAF}\\u{11AF9}-\\u{11AFF}\\u{11B0A}-\\u{11B5F}\\u{11B68}-\\u{11BBF}\\u{11BE2}-\\u{11BEF}\\u{11BFA}-\\u{11BFF}\\u{11C09}\\u{11C37}\\u{11C46}-\\u{11C4F}\\u{11C6D}-\\u{11C6F}\\u{11C90}-\\u{11C91}\\u{11CA8}\\u{11CB7}-\\u{11CFF}\\u{11D07}\\u{11D0A}\\u{11D37}-\\u{11D39}\\u{11D3B}\\u{11D3E}\\u{11D48}-\\u{11D4F}\\u{11D5A}-\\u{11D5F}\\u{11D66}\\u{11D69}\\u{11D8F}\\u{11D92}\\u{11D99}-\\u{11D9F}\\u{11DAA}-\\u{11DAF}\\u{11DDC}-\\u{11DDF}\\u{11DEA}-\\u{11EDF}\\u{11EF9}-\\u{11EFF}\\u{11F11}\\u{11F3B}-\\u{11F3D}\\u{11F5B}-\\u{11FAF}\\u{11FB1}-\\u{11FBF}\\u{11FF2}-\\u{11FFE}\\u{1239A}-\\u{123FF}\\u{1246F}\\u{12475}-\\u{1247F}\\u{12544}-\\u{12F8F}\\u{12FF3}-\\u{12FFF}\\u{13456}-\\u{1345F}\\u{143FB}-\\u{143FF}\\u{14647}-\\u{160FF}\\u{1613A}-\\u{167FF}\\u{16A39}-\\u{16A3F}\\u{16A5F}\\u{16A6A}-\\u{16A6D}\\u{16ABF}\\u{16ACA}-\\u{16ACF}\\u{16AEE}-\\u{16AEF}\\u{16AF6}-\\u{16AFF}\\u{16B46}-\\u{16B4F}\\u{16B5A}\\u{16B62}\\u{16B78}-\\u{16B7C}\\u{16B90}-\\u{16D3F}\\u{16D7A}-\\u{16E3F}\\u{16E9B}-\\u{16E9F}\\u{16EB9}-\\u{16EBA}\\u{16ED4}-\\u{16EFF}\\u{16F4B}-\\u{16F4E}\\u{16F88}-\\u{16F8E}\\u{16FA0}-\\u{16FDF}\\u{16FE5}-\\u{16FEF}\\u{16FF7}-\\u{16FFF}\\u{18CD6}-\\u{18CFE}\\u{18D1F}-\\u{18D7F}\\u{18DF3}-\\u{1AFEF}\\u{1AFF4}\\u{1AFFC}\\u{1AFFF}\\u{1B123}-\\u{1B131}\\u{1B133}-\\u{1B14F}\\u{1B153}-\\u{1B154}\\u{1B156}-\\u{1B163}\\u{1B168}-\\u{1B16F}\\u{1B2FC}-\\u{1BBFF}\\u{1BC6B}-\\u{1BC6F}\\u{1BC7D}-\\u{1BC7F}\\u{1BC89}-\\u{1BC8F}\\u{1BC9A}-\\u{1BC9B}\\u{1BCA4}-\\u{1CBFF}\\u{1CCFD}-\\u{1CCFF}\\u{1CEB4}-\\u{1CEB9}\\u{1CED1}-\\u{1CEDF}\\u{1CEF1}-\\u{1CEFF}\\u{1CF2E}-\\u{1CF2F}\\u{1CF47}-\\u{1CF4F}\\u{1CFC4}-\\u{1CFFF}\\u{1D0F6}-\\u{1D0FF}\\u{1D127}-\\u{1D128}\\u{1D1EB}-\\u{1D1FF}\\u{1D246}-\\u{1D2BF}\\u{1D2D4}-\\u{1D2DF}\\u{1D2F4}-\\u{1D2FF}\\u{1D357}-\\u{1D35F}\\u{1D379}-\\u{1D3FF}\\u{1D455}\\u{1D49D}\\u{1D4A0}-\\u{1D4A1}\\u{1D4A3}-\\u{1D4A4}\\u{1D4A7}-\\u{1D4A8}\\u{1D4AD}\\u{1D4BA}\\u{1D4BC}\\u{1D4C4}\\u{1D506}\\u{1D50B}-\\u{1D50C}\\u{1D515}\\u{1D51D}\\u{1D53A}\\u{1D53F}\\u{1D545}\\u{1D547}-\\u{1D549}\\u{1D551}\\u{1D6A6}-\\u{1D6A7}\\u{1D7CC}-\\u{1D7CD}\\u{1DA8C}-\\u{1DA9A}\\u{1DAA0}\\u{1DAB0}-\\u{1DEFF}\\u{1DF1F}-\\u{1DF24}\\u{1DF2B}-\\u{1DFFF}\\u{1E007}\\u{1E019}-\\u{1E01A}\\u{1E022}\\u{1E025}\\u{1E02B}-\\u{1E02F}\\u{1E06E}-\\u{1E08E}\\u{1E090}-\\u{1E0FF}\\u{1E12D}-\\u{1E12F}\\u{1E13E}-\\u{1E13F}\\u{1E14A}-\\u{1E14D}\\u{1E150}-\\u{1E28F}\\u{1E2AF}-\\u{1E2BF}\\u{1E2FA}-\\u{1E2FE}\\u{1E300}-\\u{1E4CF}\\u{1E4FA}-\\u{1E5CF}\\u{1E5FB}-\\u{1E5FE}\\u{1E600}-\\u{1E6BF}\\u{1E6DF}\\u{1E6F6}-\\u{1E6FD}\\u{1E700}-\\u{1E7DF}\\u{1E7E7}\\u{1E7EC}\\u{1E7EF}\\u{1E7FF}\\u{1E8C5}-\\u{1E8C6}\\u{1E8D7}-\\u{1E8FF}\\u{1E94C}-\\u{1E94F}\\u{1E95A}-\\u{1E95D}\\u{1E960}-\\u{1EC70}\\u{1ECB5}-\\u{1ED00}\\u{1ED3E}-\\u{1EDFF}\\u{1EE04}\\u{1EE20}\\u{1EE23}\\u{1EE25}-\\u{1EE26}\\u{1EE28}\\u{1EE33}\\u{1EE38}\\u{1EE3A}\\u{1EE3C}-\\u{1EE41}\\u{1EE43}-\\u{1EE46}\\u{1EE48}\\u{1EE4A}\\u{1EE4C}\\u{1EE50}\\u{1EE53}\\u{1EE55}-\\u{1EE56}\\u{1EE58}\\u{1EE5A}\\u{1EE5C}\\u{1EE5E}\\u{1EE60}\\u{1EE63}\\u{1EE65}-\\u{1EE66}\\u{1EE6B}\\u{1EE73}\\u{1EE78}\\u{1EE7D}\\u{1EE7F}\\u{1EE8A}\\u{1EE9C}-\\u{1EEA0}\\u{1EEA4}\\u{1EEAA}\\u{1EEBC}-\\u{1EEEF}\\u{1EEF2}-\\u{1EFFF}\\u{1F02C}-\\u{1F02F}\\u{1F094}-\\u{1F09F}\\u{1F0AF}-\\u{1F0B0}\\u{1F0C0}\\u{1F0D0}\\u{1F0F6}-\\u{1F0FF}\\u{1F1AE}-\\u{1F1E5}\\u{1F203}-\\u{1F20F}\\u{1F23C}-\\u{1F23F}\\u{1F249}-\\u{1F24F}\\u{1F252}-\\u{1F25F}\\u{1F266}-\\u{1F2FF}\\u{1F6D9}-\\u{1F6DB}\\u{1F6ED}-\\u{1F6EF}\\u{1F6FD}-\\u{1F6FF}\\u{1F7DA}-\\u{1F7DF}\\u{1F7EC}-\\u{1F7EF}\\u{1F7F1}-\\u{1F7FF}\\u{1F80C}-\\u{1F80F}\\u{1F848}-\\u{1F84F}\\u{1F85A}-\\u{1F85F}\\u{1F888}-\\u{1F88F}\\u{1F8AE}-\\u{1F8AF}\\u{1F8BC}-\\u{1F8BF}\\u{1F8C2}-\\u{1F8CF}\\u{1F8D9}-\\u{1F8FF}\\u{1FA58}-\\u{1FA5F}\\u{1FA6E}-\\u{1FA6F}\\u{1FA7D}-\\u{1FA7F}\\u{1FA8B}-\\u{1FA8D}\\u{1FAC7}\\u{1FAC9}-\\u{1FACC}\\u{1FADD}-\\u{1FADE}\\u{1FAEB}-\\u{1FAEE}\\u{1FAF9}-\\u{1FAFF}\\u{1FB93}\\u{1FBFB}-\\u{1FFFF}\\u{2A6E0}-\\u{2A6FF}\\u{2B81E}-\\u{2B81F}\\u{2CEAE}-\\u{2CEAF}\\u{2EBE1}-\\u{2EBEF}\\u{2EE5E}-\\u{2F7FF}\\u{2FA1E}-\\u{2FFFF}\\u{3134B}-\\u{3134F}\\u{3347A}-\\u{E0000}\\u{E0002}-\\u{E001F}\\u{E0080}-\\u{E00FF}\\u{E01F0}-\\u{10FFFF}]/u.test(\n    '\\ud800',\n  ),\n).toBe(true);\n// Unassigned code points\nexpect(\n  /[\\u0378-\\u0379\\u0380-\\u0383\\u038B\\u038D\\u03A2\\u0530\\u0557-\\u0558\\u058B-\\u058C\\u0590\\u05C8-\\u05CF\\u05EB-\\u05EE\\u05F5-\\u05FF\\u070E\\u074B-\\u074C\\u07B2-\\u07BF\\u07FB-\\u07FC\\u082E-\\u082F\\u083F\\u085C-\\u085D\\u085F\\u086B-\\u086F\\u0892-\\u0896\\u0984\\u098D-\\u098E\\u0991-\\u0992\\u09A9\\u09B1\\u09B3-\\u09B5\\u09BA-\\u09BB\\u09C5-\\u09C6\\u09C9-\\u09CA\\u09CF-\\u09D6\\u09D8-\\u09DB\\u09DE\\u09E4-\\u09E5\\u09FF-\\u0A00\\u0A04\\u0A0B-\\u0A0E\\u0A11-\\u0A12\\u0A29\\u0A31\\u0A34\\u0A37\\u0A3A-\\u0A3B\\u0A3D\\u0A43-\\u0A46\\u0A49-\\u0A4A\\u0A4E-\\u0A50\\u0A52-\\u0A58\\u0A5D\\u0A5F-\\u0A65\\u0A77-\\u0A80\\u0A84\\u0A8E\\u0A92\\u0AA9\\u0AB1\\u0AB4\\u0ABA-\\u0ABB\\u0AC6\\u0ACA\\u0ACE-\\u0ACF\\u0AD1-\\u0ADF\\u0AE4-\\u0AE5\\u0AF2-\\u0AF8\\u0B00\\u0B04\\u0B0D-\\u0B0E\\u0B11-\\u0B12\\u0B29\\u0B31\\u0B34\\u0B3A-\\u0B3B\\u0B45-\\u0B46\\u0B49-\\u0B4A\\u0B4E-\\u0B54\\u0B58-\\u0B5B\\u0B5E\\u0B64-\\u0B65\\u0B78-\\u0B81\\u0B84\\u0B8B-\\u0B8D\\u0B91\\u0B96-\\u0B98\\u0B9B\\u0B9D\\u0BA0-\\u0BA2\\u0BA5-\\u0BA7\\u0BAB-\\u0BAD\\u0BBA-\\u0BBD\\u0BC3-\\u0BC5\\u0BC9\\u0BCE-\\u0BCF\\u0BD1-\\u0BD6\\u0BD8-\\u0BE5\\u0BFB-\\u0BFF\\u0C0D\\u0C11\\u0C29\\u0C3A-\\u0C3B\\u0C45\\u0C49\\u0C4E-\\u0C54\\u0C57\\u0C5B\\u0C5E-\\u0C5F\\u0C64-\\u0C65\\u0C70-\\u0C76\\u0C8D\\u0C91\\u0CA9\\u0CB4\\u0CBA-\\u0CBB\\u0CC5\\u0CC9\\u0CCE-\\u0CD4\\u0CD7-\\u0CDB\\u0CDF\\u0CE4-\\u0CE5\\u0CF0\\u0CF4-\\u0CFF\\u0D0D\\u0D11\\u0D45\\u0D49\\u0D50-\\u0D53\\u0D64-\\u0D65\\u0D80\\u0D84\\u0D97-\\u0D99\\u0DB2\\u0DBC\\u0DBE-\\u0DBF\\u0DC7-\\u0DC9\\u0DCB-\\u0DCE\\u0DD5\\u0DD7\\u0DE0-\\u0DE5\\u0DF0-\\u0DF1\\u0DF5-\\u0E00\\u0E3B-\\u0E3E\\u0E5C-\\u0E80\\u0E83\\u0E85\\u0E8B\\u0EA4\\u0EA6\\u0EBE-\\u0EBF\\u0EC5\\u0EC7\\u0ECF\\u0EDA-\\u0EDB\\u0EE0-\\u0EFF\\u0F48\\u0F6D-\\u0F70\\u0F98\\u0FBD\\u0FCD\\u0FDB-\\u0FFF\\u10C6\\u10C8-\\u10CC\\u10CE-\\u10CF\\u1249\\u124E-\\u124F\\u1257\\u1259\\u125E-\\u125F\\u1289\\u128E-\\u128F\\u12B1\\u12B6-\\u12B7\\u12BF\\u12C1\\u12C6-\\u12C7\\u12D7\\u1311\\u1316-\\u1317\\u135B-\\u135C\\u137D-\\u137F\\u139A-\\u139F\\u13F6-\\u13F7\\u13FE-\\u13FF\\u169D-\\u169F\\u16F9-\\u16FF\\u1716-\\u171E\\u1737-\\u173F\\u1754-\\u175F\\u176D\\u1771\\u1774-\\u177F\\u17DE-\\u17DF\\u17EA-\\u17EF\\u17FA-\\u17FF\\u181A-\\u181F\\u1879-\\u187F\\u18AB-\\u18AF\\u18F6-\\u18FF\\u191F\\u192C-\\u192F\\u193C-\\u193F\\u1941-\\u1943\\u196E-\\u196F\\u1975-\\u197F\\u19AC-\\u19AF\\u19CA-\\u19CF\\u19DB-\\u19DD\\u1A1C-\\u1A1D\\u1A5F\\u1A7D-\\u1A7E\\u1A8A-\\u1A8F\\u1A9A-\\u1A9F\\u1AAE-\\u1AAF\\u1ADE-\\u1ADF\\u1AEC-\\u1AFF\\u1B4D\\u1BF4-\\u1BFB\\u1C38-\\u1C3A\\u1C4A-\\u1C4C\\u1C8B-\\u1C8F\\u1CBB-\\u1CBC\\u1CC8-\\u1CCF\\u1CFB-\\u1CFF\\u1F16-\\u1F17\\u1F1E-\\u1F1F\\u1F46-\\u1F47\\u1F4E-\\u1F4F\\u1F58\\u1F5A\\u1F5C\\u1F5E\\u1F7E-\\u1F7F\\u1FB5\\u1FC5\\u1FD4-\\u1FD5\\u1FDC\\u1FF0-\\u1FF1\\u1FF5\\u1FFF\\u2065\\u2072-\\u2073\\u208F\\u209D-\\u209F\\u20C2-\\u20CF\\u20F1-\\u20FF\\u218C-\\u218F\\u242A-\\u243F\\u244B-\\u245F\\u2B74-\\u2B75\\u2CF4-\\u2CF8\\u2D26\\u2D28-\\u2D2C\\u2D2E-\\u2D2F\\u2D68-\\u2D6E\\u2D71-\\u2D7E\\u2D97-\\u2D9F\\u2DA7\\u2DAF\\u2DB7\\u2DBF\\u2DC7\\u2DCF\\u2DD7\\u2DDF\\u2E5E-\\u2E7F\\u2E9A\\u2EF4-\\u2EFF\\u2FD6-\\u2FEF\\u3040\\u3097-\\u3098\\u3100-\\u3104\\u3130\\u318F\\u31E6-\\u31EE\\u321F\\uA48D-\\uA48F\\uA4C7-\\uA4CF\\uA62C-\\uA63F\\uA6F8-\\uA6FF\\uA7DD-\\uA7F0\\uA82D-\\uA82F\\uA83A-\\uA83F\\uA878-\\uA87F\\uA8C6-\\uA8CD\\uA8DA-\\uA8DF\\uA954-\\uA95E\\uA97D-\\uA97F\\uA9CE\\uA9DA-\\uA9DD\\uA9FF\\uAA37-\\uAA3F\\uAA4E-\\uAA4F\\uAA5A-\\uAA5B\\uAAC3-\\uAADA\\uAAF7-\\uAB00\\uAB07-\\uAB08\\uAB0F-\\uAB10\\uAB17-\\uAB1F\\uAB27\\uAB2F\\uAB6C-\\uAB6F\\uABEE-\\uABEF\\uABFA-\\uABFF\\uD7A4-\\uD7AF\\uD7C7-\\uD7CA\\uD7FC-\\uF8FF\\uFA6E-\\uFA6F\\uFADA-\\uFAFF\\uFB07-\\uFB12\\uFB18-\\uFB1C\\uFB37\\uFB3D\\uFB3F\\uFB42\\uFB45\\uFDD0-\\uFDEF\\uFE1A-\\uFE1F\\uFE53\\uFE67\\uFE6C-\\uFE6F\\uFE75\\uFEFD-\\uFEFE\\uFF00\\uFFBF-\\uFFC1\\uFFC8-\\uFFC9\\uFFD0-\\uFFD1\\uFFD8-\\uFFD9\\uFFDD-\\uFFDF\\uFFE7\\uFFEF-\\uFFF8\\uFFFE-\\uFFFF\\u{1000C}\\u{10027}\\u{1003B}\\u{1003E}\\u{1004E}-\\u{1004F}\\u{1005E}-\\u{1007F}\\u{100FB}-\\u{100FF}\\u{10103}-\\u{10106}\\u{10134}-\\u{10136}\\u{1018F}\\u{1019D}-\\u{1019F}\\u{101A1}-\\u{101CF}\\u{101FE}-\\u{1027F}\\u{1029D}-\\u{1029F}\\u{102D1}-\\u{102DF}\\u{102FC}-\\u{102FF}\\u{10324}-\\u{1032C}\\u{1034B}-\\u{1034F}\\u{1037B}-\\u{1037F}\\u{1039E}\\u{103C4}-\\u{103C7}\\u{103D6}-\\u{103FF}\\u{1049E}-\\u{1049F}\\u{104AA}-\\u{104AF}\\u{104D4}-\\u{104D7}\\u{104FC}-\\u{104FF}\\u{10528}-\\u{1052F}\\u{10564}-\\u{1056E}\\u{1057B}\\u{1058B}\\u{10593}\\u{10596}\\u{105A2}\\u{105B2}\\u{105BA}\\u{105BD}-\\u{105BF}\\u{105F4}-\\u{105FF}\\u{10737}-\\u{1073F}\\u{10756}-\\u{1075F}\\u{10768}-\\u{1077F}\\u{10786}\\u{107B1}\\u{107BB}-\\u{107FF}\\u{10806}-\\u{10807}\\u{10809}\\u{10836}\\u{10839}-\\u{1083B}\\u{1083D}-\\u{1083E}\\u{10856}\\u{1089F}-\\u{108A6}\\u{108B0}-\\u{108DF}\\u{108F3}\\u{108F6}-\\u{108FA}\\u{1091C}-\\u{1091E}\\u{1093A}-\\u{1093E}\\u{1095A}-\\u{1097F}\\u{109B8}-\\u{109BB}\\u{109D0}-\\u{109D1}\\u{10A04}\\u{10A07}-\\u{10A0B}\\u{10A14}\\u{10A18}\\u{10A36}-\\u{10A37}\\u{10A3B}-\\u{10A3E}\\u{10A49}-\\u{10A4F}\\u{10A59}-\\u{10A5F}\\u{10AA0}-\\u{10ABF}\\u{10AE7}-\\u{10AEA}\\u{10AF7}-\\u{10AFF}\\u{10B36}-\\u{10B38}\\u{10B56}-\\u{10B57}\\u{10B73}-\\u{10B77}\\u{10B92}-\\u{10B98}\\u{10B9D}-\\u{10BA8}\\u{10BB0}-\\u{10BFF}\\u{10C49}-\\u{10C7F}\\u{10CB3}-\\u{10CBF}\\u{10CF3}-\\u{10CF9}\\u{10D28}-\\u{10D2F}\\u{10D3A}-\\u{10D3F}\\u{10D66}-\\u{10D68}\\u{10D86}-\\u{10D8D}\\u{10D90}-\\u{10E5F}\\u{10E7F}\\u{10EAA}\\u{10EAE}-\\u{10EAF}\\u{10EB2}-\\u{10EC1}\\u{10EC8}-\\u{10ECF}\\u{10ED9}-\\u{10EF9}\\u{10F28}-\\u{10F2F}\\u{10F5A}-\\u{10F6F}\\u{10F8A}-\\u{10FAF}\\u{10FCC}-\\u{10FDF}\\u{10FF7}-\\u{10FFF}\\u{1104E}-\\u{11051}\\u{11076}-\\u{1107E}\\u{110C3}-\\u{110CC}\\u{110CE}-\\u{110CF}\\u{110E9}-\\u{110EF}\\u{110FA}-\\u{110FF}\\u{11135}\\u{11148}-\\u{1114F}\\u{11177}-\\u{1117F}\\u{111E0}\\u{111F5}-\\u{111FF}\\u{11212}\\u{11242}-\\u{1127F}\\u{11287}\\u{11289}\\u{1128E}\\u{1129E}\\u{112AA}-\\u{112AF}\\u{112EB}-\\u{112EF}\\u{112FA}-\\u{112FF}\\u{11304}\\u{1130D}-\\u{1130E}\\u{11311}-\\u{11312}\\u{11329}\\u{11331}\\u{11334}\\u{1133A}\\u{11345}-\\u{11346}\\u{11349}-\\u{1134A}\\u{1134E}-\\u{1134F}\\u{11351}-\\u{11356}\\u{11358}-\\u{1135C}\\u{11364}-\\u{11365}\\u{1136D}-\\u{1136F}\\u{11375}-\\u{1137F}\\u{1138A}\\u{1138C}-\\u{1138D}\\u{1138F}\\u{113B6}\\u{113C1}\\u{113C3}-\\u{113C4}\\u{113C6}\\u{113CB}\\u{113D6}\\u{113D9}-\\u{113E0}\\u{113E3}-\\u{113FF}\\u{1145C}\\u{11462}-\\u{1147F}\\u{114C8}-\\u{114CF}\\u{114DA}-\\u{1157F}\\u{115B6}-\\u{115B7}\\u{115DE}-\\u{115FF}\\u{11645}-\\u{1164F}\\u{1165A}-\\u{1165F}\\u{1166D}-\\u{1167F}\\u{116BA}-\\u{116BF}\\u{116CA}-\\u{116CF}\\u{116E4}-\\u{116FF}\\u{1171B}-\\u{1171C}\\u{1172C}-\\u{1172F}\\u{11747}-\\u{117FF}\\u{1183C}-\\u{1189F}\\u{118F3}-\\u{118FE}\\u{11907}-\\u{11908}\\u{1190A}-\\u{1190B}\\u{11914}\\u{11917}\\u{11936}\\u{11939}-\\u{1193A}\\u{11947}-\\u{1194F}\\u{1195A}-\\u{1199F}\\u{119A8}-\\u{119A9}\\u{119D8}-\\u{119D9}\\u{119E5}-\\u{119FF}\\u{11A48}-\\u{11A4F}\\u{11AA3}-\\u{11AAF}\\u{11AF9}-\\u{11AFF}\\u{11B0A}-\\u{11B5F}\\u{11B68}-\\u{11BBF}\\u{11BE2}-\\u{11BEF}\\u{11BFA}-\\u{11BFF}\\u{11C09}\\u{11C37}\\u{11C46}-\\u{11C4F}\\u{11C6D}-\\u{11C6F}\\u{11C90}-\\u{11C91}\\u{11CA8}\\u{11CB7}-\\u{11CFF}\\u{11D07}\\u{11D0A}\\u{11D37}-\\u{11D39}\\u{11D3B}\\u{11D3E}\\u{11D48}-\\u{11D4F}\\u{11D5A}-\\u{11D5F}\\u{11D66}\\u{11D69}\\u{11D8F}\\u{11D92}\\u{11D99}-\\u{11D9F}\\u{11DAA}-\\u{11DAF}\\u{11DDC}-\\u{11DDF}\\u{11DEA}-\\u{11EDF}\\u{11EF9}-\\u{11EFF}\\u{11F11}\\u{11F3B}-\\u{11F3D}\\u{11F5B}-\\u{11FAF}\\u{11FB1}-\\u{11FBF}\\u{11FF2}-\\u{11FFE}\\u{1239A}-\\u{123FF}\\u{1246F}\\u{12475}-\\u{1247F}\\u{12544}-\\u{12F8F}\\u{12FF3}-\\u{12FFF}\\u{13456}-\\u{1345F}\\u{143FB}-\\u{143FF}\\u{14647}-\\u{160FF}\\u{1613A}-\\u{167FF}\\u{16A39}-\\u{16A3F}\\u{16A5F}\\u{16A6A}-\\u{16A6D}\\u{16ABF}\\u{16ACA}-\\u{16ACF}\\u{16AEE}-\\u{16AEF}\\u{16AF6}-\\u{16AFF}\\u{16B46}-\\u{16B4F}\\u{16B5A}\\u{16B62}\\u{16B78}-\\u{16B7C}\\u{16B90}-\\u{16D3F}\\u{16D7A}-\\u{16E3F}\\u{16E9B}-\\u{16E9F}\\u{16EB9}-\\u{16EBA}\\u{16ED4}-\\u{16EFF}\\u{16F4B}-\\u{16F4E}\\u{16F88}-\\u{16F8E}\\u{16FA0}-\\u{16FDF}\\u{16FE5}-\\u{16FEF}\\u{16FF7}-\\u{16FFF}\\u{18CD6}-\\u{18CFE}\\u{18D1F}-\\u{18D7F}\\u{18DF3}-\\u{1AFEF}\\u{1AFF4}\\u{1AFFC}\\u{1AFFF}\\u{1B123}-\\u{1B131}\\u{1B133}-\\u{1B14F}\\u{1B153}-\\u{1B154}\\u{1B156}-\\u{1B163}\\u{1B168}-\\u{1B16F}\\u{1B2FC}-\\u{1BBFF}\\u{1BC6B}-\\u{1BC6F}\\u{1BC7D}-\\u{1BC7F}\\u{1BC89}-\\u{1BC8F}\\u{1BC9A}-\\u{1BC9B}\\u{1BCA4}-\\u{1CBFF}\\u{1CCFD}-\\u{1CCFF}\\u{1CEB4}-\\u{1CEB9}\\u{1CED1}-\\u{1CEDF}\\u{1CEF1}-\\u{1CEFF}\\u{1CF2E}-\\u{1CF2F}\\u{1CF47}-\\u{1CF4F}\\u{1CFC4}-\\u{1CFFF}\\u{1D0F6}-\\u{1D0FF}\\u{1D127}-\\u{1D128}\\u{1D1EB}-\\u{1D1FF}\\u{1D246}-\\u{1D2BF}\\u{1D2D4}-\\u{1D2DF}\\u{1D2F4}-\\u{1D2FF}\\u{1D357}-\\u{1D35F}\\u{1D379}-\\u{1D3FF}\\u{1D455}\\u{1D49D}\\u{1D4A0}-\\u{1D4A1}\\u{1D4A3}-\\u{1D4A4}\\u{1D4A7}-\\u{1D4A8}\\u{1D4AD}\\u{1D4BA}\\u{1D4BC}\\u{1D4C4}\\u{1D506}\\u{1D50B}-\\u{1D50C}\\u{1D515}\\u{1D51D}\\u{1D53A}\\u{1D53F}\\u{1D545}\\u{1D547}-\\u{1D549}\\u{1D551}\\u{1D6A6}-\\u{1D6A7}\\u{1D7CC}-\\u{1D7CD}\\u{1DA8C}-\\u{1DA9A}\\u{1DAA0}\\u{1DAB0}-\\u{1DEFF}\\u{1DF1F}-\\u{1DF24}\\u{1DF2B}-\\u{1DFFF}\\u{1E007}\\u{1E019}-\\u{1E01A}\\u{1E022}\\u{1E025}\\u{1E02B}-\\u{1E02F}\\u{1E06E}-\\u{1E08E}\\u{1E090}-\\u{1E0FF}\\u{1E12D}-\\u{1E12F}\\u{1E13E}-\\u{1E13F}\\u{1E14A}-\\u{1E14D}\\u{1E150}-\\u{1E28F}\\u{1E2AF}-\\u{1E2BF}\\u{1E2FA}-\\u{1E2FE}\\u{1E300}-\\u{1E4CF}\\u{1E4FA}-\\u{1E5CF}\\u{1E5FB}-\\u{1E5FE}\\u{1E600}-\\u{1E6BF}\\u{1E6DF}\\u{1E6F6}-\\u{1E6FD}\\u{1E700}-\\u{1E7DF}\\u{1E7E7}\\u{1E7EC}\\u{1E7EF}\\u{1E7FF}\\u{1E8C5}-\\u{1E8C6}\\u{1E8D7}-\\u{1E8FF}\\u{1E94C}-\\u{1E94F}\\u{1E95A}-\\u{1E95D}\\u{1E960}-\\u{1EC70}\\u{1ECB5}-\\u{1ED00}\\u{1ED3E}-\\u{1EDFF}\\u{1EE04}\\u{1EE20}\\u{1EE23}\\u{1EE25}-\\u{1EE26}\\u{1EE28}\\u{1EE33}\\u{1EE38}\\u{1EE3A}\\u{1EE3C}-\\u{1EE41}\\u{1EE43}-\\u{1EE46}\\u{1EE48}\\u{1EE4A}\\u{1EE4C}\\u{1EE50}\\u{1EE53}\\u{1EE55}-\\u{1EE56}\\u{1EE58}\\u{1EE5A}\\u{1EE5C}\\u{1EE5E}\\u{1EE60}\\u{1EE63}\\u{1EE65}-\\u{1EE66}\\u{1EE6B}\\u{1EE73}\\u{1EE78}\\u{1EE7D}\\u{1EE7F}\\u{1EE8A}\\u{1EE9C}-\\u{1EEA0}\\u{1EEA4}\\u{1EEAA}\\u{1EEBC}-\\u{1EEEF}\\u{1EEF2}-\\u{1EFFF}\\u{1F02C}-\\u{1F02F}\\u{1F094}-\\u{1F09F}\\u{1F0AF}-\\u{1F0B0}\\u{1F0C0}\\u{1F0D0}\\u{1F0F6}-\\u{1F0FF}\\u{1F1AE}-\\u{1F1E5}\\u{1F203}-\\u{1F20F}\\u{1F23C}-\\u{1F23F}\\u{1F249}-\\u{1F24F}\\u{1F252}-\\u{1F25F}\\u{1F266}-\\u{1F2FF}\\u{1F6D9}-\\u{1F6DB}\\u{1F6ED}-\\u{1F6EF}\\u{1F6FD}-\\u{1F6FF}\\u{1F7DA}-\\u{1F7DF}\\u{1F7EC}-\\u{1F7EF}\\u{1F7F1}-\\u{1F7FF}\\u{1F80C}-\\u{1F80F}\\u{1F848}-\\u{1F84F}\\u{1F85A}-\\u{1F85F}\\u{1F888}-\\u{1F88F}\\u{1F8AE}-\\u{1F8AF}\\u{1F8BC}-\\u{1F8BF}\\u{1F8C2}-\\u{1F8CF}\\u{1F8D9}-\\u{1F8FF}\\u{1FA58}-\\u{1FA5F}\\u{1FA6E}-\\u{1FA6F}\\u{1FA7D}-\\u{1FA7F}\\u{1FA8B}-\\u{1FA8D}\\u{1FAC7}\\u{1FAC9}-\\u{1FACC}\\u{1FADD}-\\u{1FADE}\\u{1FAEB}-\\u{1FAEE}\\u{1FAF9}-\\u{1FAFF}\\u{1FB93}\\u{1FBFB}-\\u{1FFFF}\\u{2A6E0}-\\u{2A6FF}\\u{2B81E}-\\u{2B81F}\\u{2CEAE}-\\u{2CEAF}\\u{2EBE1}-\\u{2EBEF}\\u{2EE5E}-\\u{2F7FF}\\u{2FA1E}-\\u{2FFFF}\\u{3134B}-\\u{3134F}\\u{3347A}-\\u{E0000}\\u{E0002}-\\u{E001F}\\u{E0080}-\\u{E00FF}\\u{E01F0}-\\u{10FFFF}]/u.test(\n    '򀀀',\n  ),\n).toBe(true);\n// Private Use Area code points\nexpect(\n  /[\\u0378-\\u0379\\u0380-\\u0383\\u038B\\u038D\\u03A2\\u0530\\u0557-\\u0558\\u058B-\\u058C\\u0590\\u05C8-\\u05CF\\u05EB-\\u05EE\\u05F5-\\u05FF\\u070E\\u074B-\\u074C\\u07B2-\\u07BF\\u07FB-\\u07FC\\u082E-\\u082F\\u083F\\u085C-\\u085D\\u085F\\u086B-\\u086F\\u0892-\\u0896\\u0984\\u098D-\\u098E\\u0991-\\u0992\\u09A9\\u09B1\\u09B3-\\u09B5\\u09BA-\\u09BB\\u09C5-\\u09C6\\u09C9-\\u09CA\\u09CF-\\u09D6\\u09D8-\\u09DB\\u09DE\\u09E4-\\u09E5\\u09FF-\\u0A00\\u0A04\\u0A0B-\\u0A0E\\u0A11-\\u0A12\\u0A29\\u0A31\\u0A34\\u0A37\\u0A3A-\\u0A3B\\u0A3D\\u0A43-\\u0A46\\u0A49-\\u0A4A\\u0A4E-\\u0A50\\u0A52-\\u0A58\\u0A5D\\u0A5F-\\u0A65\\u0A77-\\u0A80\\u0A84\\u0A8E\\u0A92\\u0AA9\\u0AB1\\u0AB4\\u0ABA-\\u0ABB\\u0AC6\\u0ACA\\u0ACE-\\u0ACF\\u0AD1-\\u0ADF\\u0AE4-\\u0AE5\\u0AF2-\\u0AF8\\u0B00\\u0B04\\u0B0D-\\u0B0E\\u0B11-\\u0B12\\u0B29\\u0B31\\u0B34\\u0B3A-\\u0B3B\\u0B45-\\u0B46\\u0B49-\\u0B4A\\u0B4E-\\u0B54\\u0B58-\\u0B5B\\u0B5E\\u0B64-\\u0B65\\u0B78-\\u0B81\\u0B84\\u0B8B-\\u0B8D\\u0B91\\u0B96-\\u0B98\\u0B9B\\u0B9D\\u0BA0-\\u0BA2\\u0BA5-\\u0BA7\\u0BAB-\\u0BAD\\u0BBA-\\u0BBD\\u0BC3-\\u0BC5\\u0BC9\\u0BCE-\\u0BCF\\u0BD1-\\u0BD6\\u0BD8-\\u0BE5\\u0BFB-\\u0BFF\\u0C0D\\u0C11\\u0C29\\u0C3A-\\u0C3B\\u0C45\\u0C49\\u0C4E-\\u0C54\\u0C57\\u0C5B\\u0C5E-\\u0C5F\\u0C64-\\u0C65\\u0C70-\\u0C76\\u0C8D\\u0C91\\u0CA9\\u0CB4\\u0CBA-\\u0CBB\\u0CC5\\u0CC9\\u0CCE-\\u0CD4\\u0CD7-\\u0CDB\\u0CDF\\u0CE4-\\u0CE5\\u0CF0\\u0CF4-\\u0CFF\\u0D0D\\u0D11\\u0D45\\u0D49\\u0D50-\\u0D53\\u0D64-\\u0D65\\u0D80\\u0D84\\u0D97-\\u0D99\\u0DB2\\u0DBC\\u0DBE-\\u0DBF\\u0DC7-\\u0DC9\\u0DCB-\\u0DCE\\u0DD5\\u0DD7\\u0DE0-\\u0DE5\\u0DF0-\\u0DF1\\u0DF5-\\u0E00\\u0E3B-\\u0E3E\\u0E5C-\\u0E80\\u0E83\\u0E85\\u0E8B\\u0EA4\\u0EA6\\u0EBE-\\u0EBF\\u0EC5\\u0EC7\\u0ECF\\u0EDA-\\u0EDB\\u0EE0-\\u0EFF\\u0F48\\u0F6D-\\u0F70\\u0F98\\u0FBD\\u0FCD\\u0FDB-\\u0FFF\\u10C6\\u10C8-\\u10CC\\u10CE-\\u10CF\\u1249\\u124E-\\u124F\\u1257\\u1259\\u125E-\\u125F\\u1289\\u128E-\\u128F\\u12B1\\u12B6-\\u12B7\\u12BF\\u12C1\\u12C6-\\u12C7\\u12D7\\u1311\\u1316-\\u1317\\u135B-\\u135C\\u137D-\\u137F\\u139A-\\u139F\\u13F6-\\u13F7\\u13FE-\\u13FF\\u169D-\\u169F\\u16F9-\\u16FF\\u1716-\\u171E\\u1737-\\u173F\\u1754-\\u175F\\u176D\\u1771\\u1774-\\u177F\\u17DE-\\u17DF\\u17EA-\\u17EF\\u17FA-\\u17FF\\u181A-\\u181F\\u1879-\\u187F\\u18AB-\\u18AF\\u18F6-\\u18FF\\u191F\\u192C-\\u192F\\u193C-\\u193F\\u1941-\\u1943\\u196E-\\u196F\\u1975-\\u197F\\u19AC-\\u19AF\\u19CA-\\u19CF\\u19DB-\\u19DD\\u1A1C-\\u1A1D\\u1A5F\\u1A7D-\\u1A7E\\u1A8A-\\u1A8F\\u1A9A-\\u1A9F\\u1AAE-\\u1AAF\\u1ADE-\\u1ADF\\u1AEC-\\u1AFF\\u1B4D\\u1BF4-\\u1BFB\\u1C38-\\u1C3A\\u1C4A-\\u1C4C\\u1C8B-\\u1C8F\\u1CBB-\\u1CBC\\u1CC8-\\u1CCF\\u1CFB-\\u1CFF\\u1F16-\\u1F17\\u1F1E-\\u1F1F\\u1F46-\\u1F47\\u1F4E-\\u1F4F\\u1F58\\u1F5A\\u1F5C\\u1F5E\\u1F7E-\\u1F7F\\u1FB5\\u1FC5\\u1FD4-\\u1FD5\\u1FDC\\u1FF0-\\u1FF1\\u1FF5\\u1FFF\\u2065\\u2072-\\u2073\\u208F\\u209D-\\u209F\\u20C2-\\u20CF\\u20F1-\\u20FF\\u218C-\\u218F\\u242A-\\u243F\\u244B-\\u245F\\u2B74-\\u2B75\\u2CF4-\\u2CF8\\u2D26\\u2D28-\\u2D2C\\u2D2E-\\u2D2F\\u2D68-\\u2D6E\\u2D71-\\u2D7E\\u2D97-\\u2D9F\\u2DA7\\u2DAF\\u2DB7\\u2DBF\\u2DC7\\u2DCF\\u2DD7\\u2DDF\\u2E5E-\\u2E7F\\u2E9A\\u2EF4-\\u2EFF\\u2FD6-\\u2FEF\\u3040\\u3097-\\u3098\\u3100-\\u3104\\u3130\\u318F\\u31E6-\\u31EE\\u321F\\uA48D-\\uA48F\\uA4C7-\\uA4CF\\uA62C-\\uA63F\\uA6F8-\\uA6FF\\uA7DD-\\uA7F0\\uA82D-\\uA82F\\uA83A-\\uA83F\\uA878-\\uA87F\\uA8C6-\\uA8CD\\uA8DA-\\uA8DF\\uA954-\\uA95E\\uA97D-\\uA97F\\uA9CE\\uA9DA-\\uA9DD\\uA9FF\\uAA37-\\uAA3F\\uAA4E-\\uAA4F\\uAA5A-\\uAA5B\\uAAC3-\\uAADA\\uAAF7-\\uAB00\\uAB07-\\uAB08\\uAB0F-\\uAB10\\uAB17-\\uAB1F\\uAB27\\uAB2F\\uAB6C-\\uAB6F\\uABEE-\\uABEF\\uABFA-\\uABFF\\uD7A4-\\uD7AF\\uD7C7-\\uD7CA\\uD7FC-\\uF8FF\\uFA6E-\\uFA6F\\uFADA-\\uFAFF\\uFB07-\\uFB12\\uFB18-\\uFB1C\\uFB37\\uFB3D\\uFB3F\\uFB42\\uFB45\\uFDD0-\\uFDEF\\uFE1A-\\uFE1F\\uFE53\\uFE67\\uFE6C-\\uFE6F\\uFE75\\uFEFD-\\uFEFE\\uFF00\\uFFBF-\\uFFC1\\uFFC8-\\uFFC9\\uFFD0-\\uFFD1\\uFFD8-\\uFFD9\\uFFDD-\\uFFDF\\uFFE7\\uFFEF-\\uFFF8\\uFFFE-\\uFFFF\\u{1000C}\\u{10027}\\u{1003B}\\u{1003E}\\u{1004E}-\\u{1004F}\\u{1005E}-\\u{1007F}\\u{100FB}-\\u{100FF}\\u{10103}-\\u{10106}\\u{10134}-\\u{10136}\\u{1018F}\\u{1019D}-\\u{1019F}\\u{101A1}-\\u{101CF}\\u{101FE}-\\u{1027F}\\u{1029D}-\\u{1029F}\\u{102D1}-\\u{102DF}\\u{102FC}-\\u{102FF}\\u{10324}-\\u{1032C}\\u{1034B}-\\u{1034F}\\u{1037B}-\\u{1037F}\\u{1039E}\\u{103C4}-\\u{103C7}\\u{103D6}-\\u{103FF}\\u{1049E}-\\u{1049F}\\u{104AA}-\\u{104AF}\\u{104D4}-\\u{104D7}\\u{104FC}-\\u{104FF}\\u{10528}-\\u{1052F}\\u{10564}-\\u{1056E}\\u{1057B}\\u{1058B}\\u{10593}\\u{10596}\\u{105A2}\\u{105B2}\\u{105BA}\\u{105BD}-\\u{105BF}\\u{105F4}-\\u{105FF}\\u{10737}-\\u{1073F}\\u{10756}-\\u{1075F}\\u{10768}-\\u{1077F}\\u{10786}\\u{107B1}\\u{107BB}-\\u{107FF}\\u{10806}-\\u{10807}\\u{10809}\\u{10836}\\u{10839}-\\u{1083B}\\u{1083D}-\\u{1083E}\\u{10856}\\u{1089F}-\\u{108A6}\\u{108B0}-\\u{108DF}\\u{108F3}\\u{108F6}-\\u{108FA}\\u{1091C}-\\u{1091E}\\u{1093A}-\\u{1093E}\\u{1095A}-\\u{1097F}\\u{109B8}-\\u{109BB}\\u{109D0}-\\u{109D1}\\u{10A04}\\u{10A07}-\\u{10A0B}\\u{10A14}\\u{10A18}\\u{10A36}-\\u{10A37}\\u{10A3B}-\\u{10A3E}\\u{10A49}-\\u{10A4F}\\u{10A59}-\\u{10A5F}\\u{10AA0}-\\u{10ABF}\\u{10AE7}-\\u{10AEA}\\u{10AF7}-\\u{10AFF}\\u{10B36}-\\u{10B38}\\u{10B56}-\\u{10B57}\\u{10B73}-\\u{10B77}\\u{10B92}-\\u{10B98}\\u{10B9D}-\\u{10BA8}\\u{10BB0}-\\u{10BFF}\\u{10C49}-\\u{10C7F}\\u{10CB3}-\\u{10CBF}\\u{10CF3}-\\u{10CF9}\\u{10D28}-\\u{10D2F}\\u{10D3A}-\\u{10D3F}\\u{10D66}-\\u{10D68}\\u{10D86}-\\u{10D8D}\\u{10D90}-\\u{10E5F}\\u{10E7F}\\u{10EAA}\\u{10EAE}-\\u{10EAF}\\u{10EB2}-\\u{10EC1}\\u{10EC8}-\\u{10ECF}\\u{10ED9}-\\u{10EF9}\\u{10F28}-\\u{10F2F}\\u{10F5A}-\\u{10F6F}\\u{10F8A}-\\u{10FAF}\\u{10FCC}-\\u{10FDF}\\u{10FF7}-\\u{10FFF}\\u{1104E}-\\u{11051}\\u{11076}-\\u{1107E}\\u{110C3}-\\u{110CC}\\u{110CE}-\\u{110CF}\\u{110E9}-\\u{110EF}\\u{110FA}-\\u{110FF}\\u{11135}\\u{11148}-\\u{1114F}\\u{11177}-\\u{1117F}\\u{111E0}\\u{111F5}-\\u{111FF}\\u{11212}\\u{11242}-\\u{1127F}\\u{11287}\\u{11289}\\u{1128E}\\u{1129E}\\u{112AA}-\\u{112AF}\\u{112EB}-\\u{112EF}\\u{112FA}-\\u{112FF}\\u{11304}\\u{1130D}-\\u{1130E}\\u{11311}-\\u{11312}\\u{11329}\\u{11331}\\u{11334}\\u{1133A}\\u{11345}-\\u{11346}\\u{11349}-\\u{1134A}\\u{1134E}-\\u{1134F}\\u{11351}-\\u{11356}\\u{11358}-\\u{1135C}\\u{11364}-\\u{11365}\\u{1136D}-\\u{1136F}\\u{11375}-\\u{1137F}\\u{1138A}\\u{1138C}-\\u{1138D}\\u{1138F}\\u{113B6}\\u{113C1}\\u{113C3}-\\u{113C4}\\u{113C6}\\u{113CB}\\u{113D6}\\u{113D9}-\\u{113E0}\\u{113E3}-\\u{113FF}\\u{1145C}\\u{11462}-\\u{1147F}\\u{114C8}-\\u{114CF}\\u{114DA}-\\u{1157F}\\u{115B6}-\\u{115B7}\\u{115DE}-\\u{115FF}\\u{11645}-\\u{1164F}\\u{1165A}-\\u{1165F}\\u{1166D}-\\u{1167F}\\u{116BA}-\\u{116BF}\\u{116CA}-\\u{116CF}\\u{116E4}-\\u{116FF}\\u{1171B}-\\u{1171C}\\u{1172C}-\\u{1172F}\\u{11747}-\\u{117FF}\\u{1183C}-\\u{1189F}\\u{118F3}-\\u{118FE}\\u{11907}-\\u{11908}\\u{1190A}-\\u{1190B}\\u{11914}\\u{11917}\\u{11936}\\u{11939}-\\u{1193A}\\u{11947}-\\u{1194F}\\u{1195A}-\\u{1199F}\\u{119A8}-\\u{119A9}\\u{119D8}-\\u{119D9}\\u{119E5}-\\u{119FF}\\u{11A48}-\\u{11A4F}\\u{11AA3}-\\u{11AAF}\\u{11AF9}-\\u{11AFF}\\u{11B0A}-\\u{11B5F}\\u{11B68}-\\u{11BBF}\\u{11BE2}-\\u{11BEF}\\u{11BFA}-\\u{11BFF}\\u{11C09}\\u{11C37}\\u{11C46}-\\u{11C4F}\\u{11C6D}-\\u{11C6F}\\u{11C90}-\\u{11C91}\\u{11CA8}\\u{11CB7}-\\u{11CFF}\\u{11D07}\\u{11D0A}\\u{11D37}-\\u{11D39}\\u{11D3B}\\u{11D3E}\\u{11D48}-\\u{11D4F}\\u{11D5A}-\\u{11D5F}\\u{11D66}\\u{11D69}\\u{11D8F}\\u{11D92}\\u{11D99}-\\u{11D9F}\\u{11DAA}-\\u{11DAF}\\u{11DDC}-\\u{11DDF}\\u{11DEA}-\\u{11EDF}\\u{11EF9}-\\u{11EFF}\\u{11F11}\\u{11F3B}-\\u{11F3D}\\u{11F5B}-\\u{11FAF}\\u{11FB1}-\\u{11FBF}\\u{11FF2}-\\u{11FFE}\\u{1239A}-\\u{123FF}\\u{1246F}\\u{12475}-\\u{1247F}\\u{12544}-\\u{12F8F}\\u{12FF3}-\\u{12FFF}\\u{13456}-\\u{1345F}\\u{143FB}-\\u{143FF}\\u{14647}-\\u{160FF}\\u{1613A}-\\u{167FF}\\u{16A39}-\\u{16A3F}\\u{16A5F}\\u{16A6A}-\\u{16A6D}\\u{16ABF}\\u{16ACA}-\\u{16ACF}\\u{16AEE}-\\u{16AEF}\\u{16AF6}-\\u{16AFF}\\u{16B46}-\\u{16B4F}\\u{16B5A}\\u{16B62}\\u{16B78}-\\u{16B7C}\\u{16B90}-\\u{16D3F}\\u{16D7A}-\\u{16E3F}\\u{16E9B}-\\u{16E9F}\\u{16EB9}-\\u{16EBA}\\u{16ED4}-\\u{16EFF}\\u{16F4B}-\\u{16F4E}\\u{16F88}-\\u{16F8E}\\u{16FA0}-\\u{16FDF}\\u{16FE5}-\\u{16FEF}\\u{16FF7}-\\u{16FFF}\\u{18CD6}-\\u{18CFE}\\u{18D1F}-\\u{18D7F}\\u{18DF3}-\\u{1AFEF}\\u{1AFF4}\\u{1AFFC}\\u{1AFFF}\\u{1B123}-\\u{1B131}\\u{1B133}-\\u{1B14F}\\u{1B153}-\\u{1B154}\\u{1B156}-\\u{1B163}\\u{1B168}-\\u{1B16F}\\u{1B2FC}-\\u{1BBFF}\\u{1BC6B}-\\u{1BC6F}\\u{1BC7D}-\\u{1BC7F}\\u{1BC89}-\\u{1BC8F}\\u{1BC9A}-\\u{1BC9B}\\u{1BCA4}-\\u{1CBFF}\\u{1CCFD}-\\u{1CCFF}\\u{1CEB4}-\\u{1CEB9}\\u{1CED1}-\\u{1CEDF}\\u{1CEF1}-\\u{1CEFF}\\u{1CF2E}-\\u{1CF2F}\\u{1CF47}-\\u{1CF4F}\\u{1CFC4}-\\u{1CFFF}\\u{1D0F6}-\\u{1D0FF}\\u{1D127}-\\u{1D128}\\u{1D1EB}-\\u{1D1FF}\\u{1D246}-\\u{1D2BF}\\u{1D2D4}-\\u{1D2DF}\\u{1D2F4}-\\u{1D2FF}\\u{1D357}-\\u{1D35F}\\u{1D379}-\\u{1D3FF}\\u{1D455}\\u{1D49D}\\u{1D4A0}-\\u{1D4A1}\\u{1D4A3}-\\u{1D4A4}\\u{1D4A7}-\\u{1D4A8}\\u{1D4AD}\\u{1D4BA}\\u{1D4BC}\\u{1D4C4}\\u{1D506}\\u{1D50B}-\\u{1D50C}\\u{1D515}\\u{1D51D}\\u{1D53A}\\u{1D53F}\\u{1D545}\\u{1D547}-\\u{1D549}\\u{1D551}\\u{1D6A6}-\\u{1D6A7}\\u{1D7CC}-\\u{1D7CD}\\u{1DA8C}-\\u{1DA9A}\\u{1DAA0}\\u{1DAB0}-\\u{1DEFF}\\u{1DF1F}-\\u{1DF24}\\u{1DF2B}-\\u{1DFFF}\\u{1E007}\\u{1E019}-\\u{1E01A}\\u{1E022}\\u{1E025}\\u{1E02B}-\\u{1E02F}\\u{1E06E}-\\u{1E08E}\\u{1E090}-\\u{1E0FF}\\u{1E12D}-\\u{1E12F}\\u{1E13E}-\\u{1E13F}\\u{1E14A}-\\u{1E14D}\\u{1E150}-\\u{1E28F}\\u{1E2AF}-\\u{1E2BF}\\u{1E2FA}-\\u{1E2FE}\\u{1E300}-\\u{1E4CF}\\u{1E4FA}-\\u{1E5CF}\\u{1E5FB}-\\u{1E5FE}\\u{1E600}-\\u{1E6BF}\\u{1E6DF}\\u{1E6F6}-\\u{1E6FD}\\u{1E700}-\\u{1E7DF}\\u{1E7E7}\\u{1E7EC}\\u{1E7EF}\\u{1E7FF}\\u{1E8C5}-\\u{1E8C6}\\u{1E8D7}-\\u{1E8FF}\\u{1E94C}-\\u{1E94F}\\u{1E95A}-\\u{1E95D}\\u{1E960}-\\u{1EC70}\\u{1ECB5}-\\u{1ED00}\\u{1ED3E}-\\u{1EDFF}\\u{1EE04}\\u{1EE20}\\u{1EE23}\\u{1EE25}-\\u{1EE26}\\u{1EE28}\\u{1EE33}\\u{1EE38}\\u{1EE3A}\\u{1EE3C}-\\u{1EE41}\\u{1EE43}-\\u{1EE46}\\u{1EE48}\\u{1EE4A}\\u{1EE4C}\\u{1EE50}\\u{1EE53}\\u{1EE55}-\\u{1EE56}\\u{1EE58}\\u{1EE5A}\\u{1EE5C}\\u{1EE5E}\\u{1EE60}\\u{1EE63}\\u{1EE65}-\\u{1EE66}\\u{1EE6B}\\u{1EE73}\\u{1EE78}\\u{1EE7D}\\u{1EE7F}\\u{1EE8A}\\u{1EE9C}-\\u{1EEA0}\\u{1EEA4}\\u{1EEAA}\\u{1EEBC}-\\u{1EEEF}\\u{1EEF2}-\\u{1EFFF}\\u{1F02C}-\\u{1F02F}\\u{1F094}-\\u{1F09F}\\u{1F0AF}-\\u{1F0B0}\\u{1F0C0}\\u{1F0D0}\\u{1F0F6}-\\u{1F0FF}\\u{1F1AE}-\\u{1F1E5}\\u{1F203}-\\u{1F20F}\\u{1F23C}-\\u{1F23F}\\u{1F249}-\\u{1F24F}\\u{1F252}-\\u{1F25F}\\u{1F266}-\\u{1F2FF}\\u{1F6D9}-\\u{1F6DB}\\u{1F6ED}-\\u{1F6EF}\\u{1F6FD}-\\u{1F6FF}\\u{1F7DA}-\\u{1F7DF}\\u{1F7EC}-\\u{1F7EF}\\u{1F7F1}-\\u{1F7FF}\\u{1F80C}-\\u{1F80F}\\u{1F848}-\\u{1F84F}\\u{1F85A}-\\u{1F85F}\\u{1F888}-\\u{1F88F}\\u{1F8AE}-\\u{1F8AF}\\u{1F8BC}-\\u{1F8BF}\\u{1F8C2}-\\u{1F8CF}\\u{1F8D9}-\\u{1F8FF}\\u{1FA58}-\\u{1FA5F}\\u{1FA6E}-\\u{1FA6F}\\u{1FA7D}-\\u{1FA7F}\\u{1FA8B}-\\u{1FA8D}\\u{1FAC7}\\u{1FAC9}-\\u{1FACC}\\u{1FADD}-\\u{1FADE}\\u{1FAEB}-\\u{1FAEE}\\u{1FAF9}-\\u{1FAFF}\\u{1FB93}\\u{1FBFB}-\\u{1FFFF}\\u{2A6E0}-\\u{2A6FF}\\u{2B81E}-\\u{2B81F}\\u{2CEAE}-\\u{2CEAF}\\u{2EBE1}-\\u{2EBEF}\\u{2EE5E}-\\u{2F7FF}\\u{2FA1E}-\\u{2FFFF}\\u{3134B}-\\u{3134F}\\u{3347A}-\\u{E0000}\\u{E0002}-\\u{E001F}\\u{E0080}-\\u{E00FF}\\u{E01F0}-\\u{10FFFF}]/u.test(\n    '',\n  ),\n).toBe(true);",
  'var regex = /[\\u0030-\\u0039\\u0041-\\u0046\\u0061-\\u0066]/u;',
  'var regex = /[\\u{1F1E6}-\\u{1F1FF}]/u;',
  'var regex = /[\\u{11EE0}-\\u{11EF8}]/u;',
  'var regex = /[\\u{1E2C0}-\\u{1E2F9}\\u{1E2FF}]/u;',
  '/[\\u060C\\u061B\\u061F\\u0660-\\u0669\\u{10E80}-\\u{10EA9}\\u{10EAB}-\\u{10EAD}\\u{10EB0}-\\u{10EB1}]/u;',
  '/[\\u{10100}-\\u{10101}\\u{12F90}-\\u{12FF2}]/u;',
  '/[\\u{11F00}-\\u{11F10}\\u{11F12}-\\u{11F3A}\\u{11F3E}-\\u{11F5A}]/u;',
  '/[\\u060C\\u061B\\u061F\\u{10D40}-\\u{10D65}\\u{10D69}-\\u{10D85}\\u{10D8E}-\\u{10D8F}]/u;',
  '/[\\u{16EA0}-\\u{16EB8}\\u{16EBB}-\\u{16ED3}]/u;',
] as const;

export const fixtureCases = [
  {
    title: 'with unicode flag — script extensions (input)',
    source: 'var regex = /\\p{Script_Extensions=Anatolian_Hieroglyphs}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[0],
      },
    ],
  },
  {
    title: 'with unicode flag — script zzzz (exec)',
    source:
      '// Surrogate code points\nexpect(/\\p{Script=Zzzz}/u.test("\\uD800")).toBe(true);\n\n// Unassigned code points\nexpect(/\\p{Script_Extensions=Unknown}/u.test("\\u{80000}")).toBe(true);\n\n// Private Use Area code points\nexpect(/\\p{Script_Extensions=Zzzz}/u.test("\\uE800")).toBe(true);\n',
    filename: 'exec.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[1],
      },
    ],
  },
  {
    title: 'with unicode flag — simple (input)',
    source: 'var regex = /\\p{ASCII_Hex_Digit}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[2],
      },
    ],
  },
  {
    title: 'with unicode flag — unicode 10 (input)',
    source: 'var regex = /\\p{Regional_Indicator}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[3],
      },
    ],
  },
  {
    title: 'with unicode flag — unicode 11 (input)',
    source: 'var regex = /\\p{Script_Extensions=Makasar}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[4],
      },
    ],
  },
  {
    title: 'with unicode flag — unicode 12 (input)',
    source: 'var regex = /[\\p{Script_Extensions=Wancho}]/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
  {
    title: 'with unicode flag — unicode 13 (input)',
    source: '/\\p{Script_Extensions=Yezi}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[6],
      },
    ],
  },
  {
    title: 'with unicode flag — unicode 14 (input)',
    source: '/\\p{Script_Extensions=Cypro_Minoan}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[7],
      },
    ],
  },
  {
    title: 'with unicode flag — unicode 15 (input)',
    source: '/\\p{Script_Extensions=Kawi}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[8],
      },
    ],
  },
  {
    title: 'with unicode flag — unicode 16 (input)',
    source: '/\\p{Script_Extensions=Garay}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[9],
      },
    ],
  },
  {
    title: 'with unicode flag — unicode 17 (input)',
    source: '/\\p{Script_Extensions=Berf}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[10],
      },
    ],
  },
  {
    title: 'without unicode flag — unicode 12 (input)',
    source: 'var regex = /\\p{Script_Extensions=Wancho}/u;\n',
    filename: 'input.js',
    modes: [
      {
        title: 'default',
        options: {
          transforms: {
            regexpUnicodePropertyEscapes: true,
          },
          helpers: {
            mode: 'inline',
          },
        },
        output: expectedOutputs[5],
      },
    ],
  },
] as const satisfies readonly FixtureCase[];

runFixtures(fixtureCases);
