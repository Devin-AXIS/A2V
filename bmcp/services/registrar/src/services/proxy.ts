import { fetch } from 'undici';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { MappingService } from './mapping';

export interface ProxyRequest {
    mappingId: string;
    originalUrl: string;
    path: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    callerId: string;
}

export interface ProxyResult {
    data: any;
    status: number;
    headers: Record<string, string>;
    callId: string;
    fingerprint: string;
    error?: string;
}

export class ProxyService {
    private mappingService = new MappingService();

    async getMapping(id: string) {
        return await this.mappingService.getById(id);
    }

    async proxyRequest(request: ProxyRequest): Promise<ProxyResult> {
        const callId = uuidv4();
        const startTime = Date.now();

        try {
            // 构建目标 URL
            const targetUrl = this.buildTargetUrl(request.originalUrl, request.path);

            // 准备请求头（移除一些不需要的头部）
            const headers = this.prepareHeaders(request.headers);

            // 执行代理请求
            const response = await fetch(targetUrl, {
                method: request.method,
                headers,
                body: request.body || undefined,
                // 设置超时
                signal: AbortSignal.timeout(30000) // 30秒超时
            });

            // 读取响应数据
            const responseText = await response.text();
            let responseData;

            try {
                responseData = JSON.parse(responseText);
            } catch {
                responseData = responseText;
            }

            // 生成指纹
            const fingerprint = this.generateFingerprint({
                url: targetUrl,
                method: request.method,
                status: response.status,
                timestamp: startTime
            });

            // 收集响应头
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            return {
                data: responseData,
                status: response.status,
                headers: responseHeaders,
                callId,
                fingerprint
            };

        } catch (error) {
            console.error('代理请求失败:', error);

            return {
                data: { error: '代理请求失败', message: error.message },
                status: 500,
                headers: {},
                callId,
                fingerprint: this.generateFingerprint({
                    url: request.originalUrl,
                    method: request.method,
                    status: 500,
                    timestamp: startTime
                }),
                error: error.message
            };
        }
    }

    private buildTargetUrl(originalUrl: string, path: string): string {
        const baseUrl = originalUrl.replace(/\/$/, ''); // 移除末尾斜杠
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    }

    private prepareHeaders(headers: Record<string, string>): Record<string, string> {
        const filteredHeaders = { ...headers };

        // 移除一些不需要转发的头部
        delete filteredHeaders['host'];
        delete filteredHeaders['content-length'];
        delete filteredHeaders['connection'];
        delete filteredHeaders['upgrade'];
        delete filteredHeaders['proxy-connection'];
        delete filteredHeaders['proxy-authorization'];

        return filteredHeaders;
    }

    private generateFingerprint(data: {
        url: string;
        method: string;
        status: number;
        timestamp: number;
    }): string {
        const fingerprint = crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');

        return fingerprint;
    }
}
