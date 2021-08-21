/*******************************************************************************

    The class that defines the Validator.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import Ajv from "ajv";

/**
 * @ignore
 */
const ajv = new Ajv();

/**
 * Class for validating JSON data
 */
export class JSONValidator {
    /**
     * @ignore
     */
    private static schemas: Map<string, object> = new Map([
        [
            "Block",
            {
                title: "Block",
                type: "object",
                properties: {
                    header: {
                        type: "object",
                    },
                    txs: {
                        items: {
                            type: "object",
                        },
                        type: "array",
                    },
                    merkle_tree: {
                        items: {
                            type: "string",
                        },
                        type: "array",
                    },
                },
                additionalProperties: false,
                required: ["header", "txs", "merkle_tree"],
            },
        ],
        [
            "BlockHeader",
            {
                title: "BlockHeader",
                type: "object",
                properties: {
                    prev_block: {
                        type: "string",
                    },
                    height: {
                        type: "string",
                    },
                    merkle_root: {
                        type: "string",
                    },
                    validators: {
                        type: "string",
                    },
                    signature: {
                        type: "string",
                    },
                    enrollments: {
                        items: {
                            type: "object",
                        },
                        type: "array",
                    },
                    random_seed: {
                        type: "string",
                    },
                    missing_validators: {
                        items: {
                            type: "number",
                        },
                        type: "array",
                    },
                    time_offset: {
                        type: "number",
                    },
                },
                additionalProperties: false,
                required: [
                    "prev_block",
                    "height",
                    "merkle_root",
                    "validators",
                    "signature",
                    "enrollments",
                    "random_seed",
                    "missing_validators",
                    "time_offset",
                ],
            },
        ],
        [
            "Enrollment",
            {
                title: "Enrollment",
                type: "object",
                properties: {
                    utxo_key: {
                        type: "string",
                    },
                    commitment: {
                        type: "string",
                    },
                    cycle_length: {
                        type: "number",
                    },
                    enroll_sig: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["utxo_key", "commitment", "cycle_length", "enroll_sig"],
            },
        ],
        [
            "PreImageInfo",
            {
                title: "PreImageInfo",
                type: "object",
                properties: {
                    utxo: {
                        type: "string",
                    },
                    hash: {
                        type: "string",
                    },
                    height: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["utxo", "hash", "height"],
            },
        ],
        [
            "Transaction",
            {
                title: "Transaction",
                type: "object",
                properties: {
                    inputs: {
                        items: {
                            type: "object",
                        },
                        type: "array",
                    },
                    outputs: {
                        items: {
                            type: "object",
                        },
                        type: "array",
                    },
                    payload: {
                        type: "string",
                    },
                    lock_height: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["inputs", "outputs", "payload", "lock_height"],
            },
        ],
        [
            "TxInput",
            {
                title: "TxInput",
                type: "object",
                properties: {
                    utxo: {
                        type: "string",
                    },
                    unlock: {
                        type: "object",
                    },
                    unlock_age: {
                        type: "integer",
                    },
                },
                additionalProperties: false,
                required: ["utxo", "unlock", "unlock_age"],
            },
        ],
        [
            "TxOutput",
            {
                title: "TxOutput",
                type: "object",
                properties: {
                    type: {
                        type: "number",
                    },
                    value: {
                        type: "string",
                    },
                    lock: {
                        type: "object",
                    },
                },
                additionalProperties: false,
                required: ["type", "value", "lock"],
            },
        ],
        [
            "Lock",
            {
                title: "Lock",
                type: "object",
                properties: {
                    type: {
                        type: "integer",
                    },
                    bytes: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["type", "bytes"],
            },
        ],
        [
            "Unlock",
            {
                title: "Lock",
                type: "object",
                properties: {
                    bytes: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["bytes"],
            },
        ],
        [
            "Balance",
            {
                title: "Balance",
                type: "object",
                properties: {
                    address: {
                        type: "string",
                    },
                    balance: {
                        type: "string",
                    },
                    spendable: {
                        type: "string",
                    },
                    frozen: {
                        type: "string",
                    },
                    locked: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["address", "balance", "spendable", "frozen", "locked"],
            },
        ],
        [
            "Invoice",
            {
                title: "Invoice",
                type: "object",
                properties: {
                    payment_hash: {
                        type: "string",
                    },
                    destination: {
                        type: "string",
                    },
                    amount: {
                        type: "string",
                    },
                    expiry: {
                        type: "number",
                    },
                    description: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["payment_hash", "destination", "amount", "expiry", "description"],
            },
        ],
        [
            "InvoicePair",
            {
                title: "InvoicePair",
                type: "object",
                properties: {
                    invoice: {
                        type: "object",
                    },
                    secret: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["invoice", "secret"],
            },
        ],
        [
            "UTXO",
            {
                title: "UTXO",
                type: "object",
                properties: {
                    unlock_height: {
                        type: "string",
                    },
                    output: {
                        type: "object",
                    },
                },
                additionalProperties: false,
                required: ["unlock_height", "output"],
            },
        ],
        [
            "ChannelConfig",
            {
                title: "ChannelConfig",
                type: "object",
                properties: {
                    gen_hash: {
                        type: "string",
                    },
                    funder_pk: {
                        type: "string",
                    },
                    peer_pk: {
                        type: "string",
                    },
                    pair_pk: {
                        type: "string",
                    },
                    num_peers: {
                        type: "integer",
                    },
                    update_pair_pk: {
                        type: "string",
                    },
                    funding_tx: {
                        type: "string",
                    },
                    funding_tx_hash: {
                        type: "string",
                    },
                    funding_utxo_idx: {
                        type: "number",
                    },
                    capacity: {
                        type: "string",
                    },
                    settle_time: {
                        type: "number",
                    },
                    cooperative_close_timeout: {
                        type: "number",
                    },
                },
                additionalProperties: true,
                required: [
                    "gen_hash",
                    "funder_pk",
                    "peer_pk",
                    "pair_pk",
                    "num_peers",
                    "update_pair_pk",
                    "funding_tx",
                    "funding_tx_hash",
                    "funding_utxo_idx",
                    "capacity",
                    "settle_time",
                    "cooperative_close_timeout",
                ],
            },
        ],
        [
            "ChannelInfo",
            {
                title: "ChannelInfo",
                type: "object",
                properties: {
                    chan_id: {
                        type: "string",
                    },
                    owner_key: {
                        type: "string",
                    },
                    peer_key: {
                        type: "string",
                    },
                    owner_balance: {
                        type: "string",
                    },
                    peer_balance: {
                        type: "string",
                    },
                    state: {
                        type: "integer",
                    },
                },
                additionalProperties: false,
                required: ["chan_id", "owner_key", "peer_key", "owner_balance", "peer_balance", "state"],
            },
        ],
        [
            "FeeUTXOs",
            {
                title: "FeeUTXOs",
                type: "object",
                properties: {
                    utxos: {
                        type: "array",
                    },
                    total_value: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["utxos", "total_value"],
            },
        ],
        [
            "OpenNewChannelRequest",
            {
                title: "OpenNewChannelRequest",
                type: "object",
                properties: {
                    reg_pk: {
                        type: "string",
                    },
                    funding_utxo: {
                        type: "object",
                    },
                    funding_utxo_hash: {
                        type: "string",
                    },
                    capacity: {
                        type: "string",
                    },
                    settle_time: {
                        type: "integer",
                    },
                    peer_pk: {
                        type: "string",
                    },
                    signature: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: [
                    "reg_pk",
                    "funding_utxo",
                    "funding_utxo_hash",
                    "capacity",
                    "settle_time",
                    "peer_pk",
                    "signature",
                ],
            },
        ],
        [
            "CreateNewInvoiceRequest",
            {
                title: "CreateNewInvoiceRequest",
                type: "object",
                properties: {
                    reg_pk: {
                        type: "string",
                    },
                    amount: {
                        type: "string",
                    },
                    expiry: {
                        type: "number",
                    },
                    description: {
                        type: "string",
                    },
                    signature: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["reg_pk", "amount", "expiry", "description", "signature"],
            },
        ],
        [
            "BeginCloseRequest",
            {
                title: "BeginCloseRequest",
                type: "object",
                properties: {
                    reg_pk: {
                        type: "string",
                    },
                    chan_id: {
                        type: "string",
                    },
                    signature: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["reg_pk", "chan_id", "signature"],
            },
        ],
        [
            "PayInvoiceRequest",
            {
                title: "PayInvoiceRequest",
                type: "object",
                properties: {
                    reg_pk: {
                        type: "string",
                    },
                    invoice: {
                        type: "string",
                    },
                    signature: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["reg_pk", "invoice", "signature"],
            },
        ],
        [
            "ChangeFeeRequest",
            {
                title: "ChangeFeeRequest",
                type: "object",
                properties: {
                    reg_pk: {
                        type: "string",
                    },
                    chan_id: {
                        type: "string",
                    },
                    fixed_fee: {
                        type: "string",
                    },
                    proportional_fee: {
                        type: "string",
                    },
                    signature: {
                        type: "string",
                    },
                },
                additionalProperties: false,
                required: ["reg_pk", "chan_id", "fixed_fee", "proportional_fee", "signature"],
            },
        ],
    ]);

    /**
     * The map of validation functions created to reuse -
     * an once created validation function.
     */
    private static validators = new Map<string, Ajv.ValidateFunction>();

    /**
     * Create a validation function using the schema.
     * Return it if it has already been created.
     * @param name The JSON schema name
     * @returns The function of validation
     */
    private static buildValidator(name: string): Ajv.ValidateFunction {
        let validator = JSONValidator.validators.get(name);
        if (validator === undefined) {
            const schema = JSONValidator.schemas.get(name);
            if (schema !== undefined) {
                validator = ajv.compile(schema);
                JSONValidator.validators.set(name, validator);
            } else throw new Error(`Non-existent schema accessed: ${name}`);
        }
        return validator as Ajv.ValidateFunction;
    }

    /**
     * Check the validity of a JSON data.
     * @param validator The Function to validate JSON
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise `false`
     */
    private static isValid(validator: Ajv.ValidateFunction, candidate: any) {
        return validator(candidate) === true;
    }

    /**
     * Check the validity of a JSON data.
     * @param schema_name The JSON schema name
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise throw an `Error`
     */
    public static isValidOtherwiseThrow(schema_name: string, candidate: any) {
        const validator = this.buildValidator(schema_name);
        if (this.isValid(validator, candidate)) {
            return true;
        } else if (validator.errors !== undefined && validator.errors !== null && validator.errors.length > 0) {
            if (validator.errors.length === 1) {
                throw new Error(`Validation failed: ${schema_name} - ` + validator.errors[0].message);
            } else {
                const messages = [];
                for (const error of validator.errors) messages.push(error.message);
                throw new Error(`Validation failed: ${schema_name} - ` + messages.join("\n"));
            }
        } else {
            throw new Error(`Validation failed: ${schema_name}`);
        }
    }

    /**
     * Check the validity of a JSON data.
     * @param schema_name The JSON schema name
     * @param candidate The JSON data
     * @returns `true` if the JSON is valid, otherwise `false`
     */
    public static isValidOtherwiseNoThrow(schema_name: string, candidate: any) {
        const validator = this.buildValidator(schema_name);
        return this.isValid(validator, candidate);
    }
}
