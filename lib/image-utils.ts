/**
 * 图片 URL 工具函数
 * 用于统一处理图片 URL，确保兼容新旧格式
 */

/**
 * 规范化图片 URL
 * 如果是 /uploads/ 开头的路径，转换为 /api/uploads/ 路径
 * 这样可以确保在生产环境中也能正常访问
 */
export function normalizeImageUrl(url: string | undefined | null): string {
    if (!url) {
        return '/placeholder.svg';
    }

    // 如果是 base64 格式，直接返回
    if (url.startsWith('data:image')) {
        return url;
    }

    // 如果是 /uploads/ 开头的路径，转换为 API 路由
    if (url.startsWith('/uploads/')) {
        return url.replace('/uploads/', '/api/uploads/');
    }

    // 其他情况直接返回
    return url;
}

