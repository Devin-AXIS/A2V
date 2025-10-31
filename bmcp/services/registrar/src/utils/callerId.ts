import crypto from 'crypto';

/**
 * UUID 格式的正则表达式
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 检查字符串是否是有效的 UUID
 */
function isValidUUID(str: string): boolean {
    return UUID_REGEX.test(str);
}

/**
 * 将以太坊地址或其他标识符转换为 UUID 格式
 * 使用确定性哈希，确保相同的输入总是产生相同的 UUID
 */
function stringToUUID(input: string): string {
    // 使用 SHA-256 哈希
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    
    // 将哈希转换为 UUID v4 格式（保留版本和变体位）
    // UUID 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // 其中 4 表示版本，y 必须是 8、9、a 或 b (即二进制 10xx)
    const part1 = hash.substring(0, 8);
    const part2 = hash.substring(8, 12);
    const part3 = '4' + hash.substring(13, 16); // 版本 4 (0100)
    
    // 变体位：确保第一个字符是 8, 9, a, 或 b (即二进制 10xx)
    const variantNibble = parseInt(hash[16], 16);
    const variantValue = ((variantNibble & 0x3) | 0x8).toString(16); // 10xx
    const part4 = variantValue + hash.substring(17, 20);
    
    const part5 = hash.substring(20, 32);
    
    const uuid = [part1, part2, part3, part4, part5].join('-');
    
    return uuid;
}

/**
 * 规范化 callerId，确保它是有效的 UUID
 * - 如果已经是 UUID，直接返回
 * - 如果是 'anonymous'，转换为一个固定的 UUID
 * - 如果是其他格式（如以太坊地址），转换为确定性 UUID
 */
export function normalizeCallerId(callerId: string): string {
    // 处理空字符串或未定义
    if (!callerId || callerId.trim() === '') {
        return '00000000-0000-0000-0000-000000000000'; // 空 UUID
    }
    
    const trimmed = callerId.trim().toLowerCase();
    
    // 如果是 'anonymous'，返回一个固定的 UUID
    if (trimmed === 'anonymous') {
        return 'ffffffff-ffff-ffff-ffff-ffffffffffff'; // anonymous UUID
    }
    
    // 如果已经是有效的 UUID，直接返回
    if (isValidUUID(trimmed)) {
        return trimmed;
    }
    
    // 否则转换为 UUID（适用于以太坊地址等）
    return stringToUUID(trimmed);
}

