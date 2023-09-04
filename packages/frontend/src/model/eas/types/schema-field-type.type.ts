export const SCHEMA_FIELD_TYPES = [
  {
    name: 'address',
    description: 'An address can be any ethereum address or contract address',
  },
  {
    name: 'string',
    description: 'A string can be any text of arbitrary length.',
  },
  {
    name: 'bool',
    description: 'A bool can either be on or off.',
  },
  {
    name: 'bytes32',
    description:
      'A bytes32 is a 32 byte value. Useful for unique identifiers or small data.',
  },
  {
    name: 'bytes',
    description: 'A bytes value is an arbitrary byte value.',
  },
  {
    name: 'uint8',
    description: 'A uint8 is a 8 integer value between 0 and 256',
  },
  {
    name: 'uint16',
    description: 'A uint16 is a 16 integer value between 0 and 65536',
  },
  {
    name: 'uint24',
    description: 'A uint24 is a 24 integer value between 0 and 16777216',
  },
  {
    name: 'uint32',
    description: 'A uint32 is a 32 integer value between 0 and 4294967296',
  },
  {
    name: 'uint40',
    description: 'A uint40 is a 40 integer value between 0 and 1099511627776',
  },
  {
    name: 'uint48',
    description: 'A uint48 is a 48 integer value between 0 and 281474976710656',
  },
  {
    name: 'uint56',
    description:
      'A uint56 is a 56 integer value between 0 and 72057594037927936',
  },
  {
    name: 'uint64',
    description:
      'A uint64 is a 64 integer value between 0 and 18446744073709551616',
  },
  {
    name: 'uint72',
    description:
      'A uint72 is a 72 integer value between 0 and 4722366482869645213696',
  },
  {
    name: 'uint80',
    description:
      'A uint80 is a 80 integer value between 0 and 1208925819614629174706176',
  },
  {
    name: 'uint88',
    description:
      'A uint88 is a 88 integer value between 0 and 309485009821345068724781056',
  },
  {
    name: 'uint96',
    description:
      'A uint96 is a 96 integer value between 0 and 79228162514264337593543950336',
  },
  {
    name: 'uint104',
    description:
      'A uint104 is a 104 integer value between 0 and 20282409603651670423947251286016',
  },
  {
    name: 'uint112',
    description:
      'A uint112 is a 112 integer value between 0 and 5192296858534827628530496329220096',
  },
  {
    name: 'uint120',
    description:
      'A uint120 is a 120 integer value between 0 and 1329227995784915872903807060280344576',
  },
  {
    name: 'uint128',
    description:
      'A uint128 is a 128 integer value between 0 and 340282366920938463463374607431768211456',
  },
  {
    name: 'uint136',
    description:
      'A uint136 is a 136 integer value between 0 and 87112285931760246646623899502532662132736',
  },
  {
    name: 'uint144',
    description:
      'A uint144 is a 144 integer value between 0 and 22300745198530623141535718272648361505980416',
  },
  {
    name: 'uint152',
    description:
      'A uint152 is a 152 integer value between 0 and 5708990770823839524233143877797980545530986496',
  },
  {
    name: 'uint160',
    description:
      'A uint160 is a 160 integer value between 0 and 1461501637330902918203684832716283019655932542976',
  },
  {
    name: 'uint168',
    description:
      'A uint168 is a 168 integer value between 0 and 374144419156711147060143317175368453031918731001856',
  },
  {
    name: 'uint176',
    description:
      'A uint176 is a 176 integer value between 0 and 95780971304118053647396689196894323976171195136475136',
  },
  {
    name: 'uint184',
    description:
      'A uint184 is a 184 integer value between 0 and 24519928653854221733733552434404946937899825954937634816',
  },
  {
    name: 'uint192',
    description:
      'A uint192 is a 192 integer value between 0 and 6277101735386680763835789423207666416102355444464034512896',
  },
  {
    name: 'uint200',
    description:
      'A uint200 is a 200 integer value between 0 and 1606938044258990275541962092341162602522202993782792835301376',
  },
  {
    name: 'uint208',
    description:
      'A uint208 is a 208 integer value between 0 and 411376139330301510538742295639337626245683966408394965837152256',
  },
  {
    name: 'uint216',
    description:
      'A uint216 is a 216 integer value between 0 and 105312291668557186697918027683670432318895095400549111254310977536',
  },
  {
    name: 'uint224',
    description:
      'A uint224 is a 224 integer value between 0 and 26959946667150639794667015087019630673637144422540572481103610249216',
  },
  {
    name: 'uint232',
    description:
      'A uint232 is a 232 integer value between 0 and 68977552734371073360835493889708558676882996288460761669049583268864',
  },
  {
    name: 'uint240',
    description:
      'A uint240 is a 240 integer value between 0 and 1766847064778384329583297500742918515827483896875618958121606201292619776',
  },
  {
    name: 'uint248',
    description:
      'A uint248 is a 248 integer value between 0 and 4523128485832663883733241601901871406534423780709393254959260367105535646096384',
  },
  {
    name: 'uint256',
    description:
      'A uint256 is a 256 integer value between 0 and 115792089237316195423570985008687907853269984665640564039457584007913129639936',
  },
] as const;

export const SCHEMA_FIELD_TYPE_NAMES = SCHEMA_FIELD_TYPES.map((dt) => dt.name);

export type SchemaFieldTypeName = (typeof SCHEMA_FIELD_TYPE_NAMES)[number];

export type SchemaFieldType = {
  name: SchemaFieldTypeName;
  description: string;
};
