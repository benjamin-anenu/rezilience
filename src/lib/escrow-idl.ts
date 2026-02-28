/**
 * IDL for the Rezilience Escrow program (resilence_escrow).
 * Program ID: GzZ9chKwr4wQD6cQcxNYZpwgumE3dX5tVt4a5McenDMz
 *
 * NOTE: bounty_id is a 32-char hex string (UUID without dashes).
 */

export const ESCROW_PROGRAM_ID = "GzZ9chKwr4wQD6cQcxNYZpwgumE3dX5tVt4a5McenDMz";

export const ESCROW_IDL = {
  address: "GzZ9chKwr4wQD6cQcxNYZpwgumE3dX5tVt4a5McenDMz",
  metadata: {
    name: "resilence_escrow",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "cancel_escrow",
      docs: [
        "Cancels the escrow, returning all SOL (reward + rent) to the creator.",
        "Only the original creator can cancel -- governance cannot.",
      ],
      discriminator: [156, 203, 54, 179, 38, 72, 33, 21],
      accounts: [
        { name: "creator", writable: true, signer: true },
        {
          name: "escrow_account",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [101, 115, 99, 114, 111, 119] },
              { kind: "arg", path: "bounty_id" },
            ],
          },
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [{ name: "_bounty_id", type: "string" }],
    },
    {
      name: "create_escrow",
      docs: [
        'Creates a new escrow PDA, locking SOL from the creator.',
        '`bounty_id` must be a 32-char hex string (UUID without dashes).',
        '`authority` is the Realms governance PDA or the creator pubkey (fallback).',
      ],
      discriminator: [253, 215, 165, 116, 36, 108, 68, 80],
      accounts: [
        { name: "creator", writable: true, signer: true },
        {
          name: "escrow_account",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [101, 115, 99, 114, 111, 119] },
              { kind: "arg", path: "bounty_id" },
            ],
          },
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "bounty_id", type: "string" },
        { name: "claimer", type: "pubkey" },
        { name: "authority", type: "pubkey" },
        { name: "realm_dao_address", type: "pubkey" },
        { name: "reward_lamports", type: "u64" },
      ],
    },
    {
      name: "release_escrow",
      docs: [
        "Releases escrowed SOL to the claimer. Must be signed by the authority",
        "(governance PDA via Realms CPI, or the creator in fallback mode).",
      ],
      discriminator: [146, 253, 129, 233, 20, 145, 181, 206],
      accounts: [
        { name: "authority", docs: ["The governance PDA or creator that is authorized to release"], signer: true },
        {
          name: "escrow_account",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [101, 115, 99, 114, 111, 119] },
              { kind: "arg", path: "bounty_id" },
            ],
          },
        },
        { name: "creator", writable: true },
        { name: "claimer", writable: true },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [{ name: "_bounty_id", type: "string" }],
    },
  ],
  accounts: [
    {
      name: "EscrowAccount",
      discriminator: [36, 69, 48, 18, 128, 225, 125, 135],
    },
  ],
  errors: [
    { code: 6000, name: "AlreadyFinalized", msg: "Escrow already released or cancelled" },
    { code: 6001, name: "UnauthorizedCreator", msg: "Only the escrow creator can cancel" },
    { code: 6002, name: "UnauthorizedAuthority", msg: "Authority does not match escrow" },
    { code: 6003, name: "WrongClaimer", msg: "Claimer does not match escrow" },
    { code: 6004, name: "SelfEscrow", msg: "Creator and claimer cannot be the same" },
    { code: 6005, name: "ZeroReward", msg: "Reward must be greater than zero" },
    { code: 6006, name: "InvalidBountyId", msg: "Bounty ID must be 32 characters (UUID hex without dashes)" },
  ],
  types: [
    {
      name: "EscrowAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "bounty_id", docs: ["UUID hex without dashes (32 bytes)"], type: { array: ["u8", 32] } },
          { name: "creator", type: "pubkey" },
          { name: "claimer", type: "pubkey" },
          { name: "authority", docs: ["Governance PDA or creator pubkey"], type: "pubkey" },
          { name: "realm_dao_address", type: "pubkey" },
          { name: "reward_lamports", type: "u64" },
          { name: "status", docs: ["0 = Created, 1 = Released, 2 = Cancelled"], type: "u8" },
          { name: "created_at", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
} as const;
