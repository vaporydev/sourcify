import * as chainOptions from '../chains.json';
import cbor from 'cbor';

/**
 * Returns the chains where Sourcify is currently applicable.
 * @returns array of currently supported chains
 */
export function getSupportedChains(): Array<any> {
    const supportedChains = [];
    for (const chainOption in chainOptions) {
        const chainOptionValue = chainOptions[chainOption];
        if (chainOptionValue.supported) {
            supportedChains.push(chainOptionValue);
        }
    }
    return supportedChains;
}

export function getChainId(chain: string): string {
    for (const chainOption in chainOptions) {
        const network = chainOptions[chainOption].network;
        const chainId = chainOptions[chainOption].chainId;
        if ((network && network.toLowerCase() === chain) || String(chainId) === chain) {
            return String(chainOptions[chainOption].chainId);
        }
    }

    throw new Error(`Chain ${chain} not supported!`);
}

export function getIdFromChainName(chain: string): number {
    for (const chainOption in chainOptions) {
        if (chainOptions[chainOption].network === chain) {
            return chainOptions[chainOption].chainId;
        }
    }
    throw new Error("Chain not found!");
}

export function getChainByName(name: string): any {
    for (const chainOption in chainOptions) {
        const otherName = chainOptions[chainOption].name;
        if (otherName === name) {
            return chainOptions[chainOption];
        }
    }

    throw new Error(`Chain ${name} not supported!`)
}

/**
 * Extracts cbor encoded segement from bytecode
 * @example
 *   const bytes = Web3.utils.hexToBytes(evm.deployedBytecode);
 *   cborDecode(bytes);
 *   > { ipfs: "QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqK4Rq" }
 *
 * @param  {number[]} bytecode
 * @return {any}
 */
export function cborDecode(bytecode: number[]): any {
    const cborLength: number = bytecode[bytecode.length - 2] * 0x100 + bytecode[bytecode.length - 1];
    const bytecodeBuffer = Buffer.from(bytecode.slice(bytecode.length - 2 - cborLength, -2));
    return cbor.decodeFirstSync(bytecodeBuffer);
}

/**
 * Asserts that the number of keys of the provided object is expectedSize.
 * If not, logs an appropriate message (if log function provided) and throws an Error.
 * @param object the object to check
 * @param objectName the name of the object to use in error messages
 * @param expectedSize the size that the object should have
 * @param log optional log function
 */
export function assertObjectSize(object: any, expectedSize: number, log?: Function, info?: any) {
    let err = "";
    
    if (!object) {
        err = `Cannot assert for ${object}.`;
    } else {
        const objectSize = Object.keys(object).length;   
        if (objectSize !== expectedSize) {
            err = `Error in size assertion! Actual size: ${objectSize}. Expected size: ${expectedSize}.`;
        }
    }

    if (err) {
        if (log) {
            if (info) {
                log(info, err);
            } else {
                log(err);
            }
        }
        throw new Error(err);
    }
}