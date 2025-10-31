import { fetch } from 'undici';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { MappingService } from './mapping';

import { type Mapping } from '@bmcp/schema';

export interface ProxyRequest {
    mappingId: string;
    originalUrl: string;
    path: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    callerId: string;
    mapping?: Mapping; // 可选的映射信息，避免重复查询
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
        let targetUrl = '';

        try {
            // 获取映射信息以检查MCP配置（如果未提供则查询）
            const mapping = request.mapping || await this.mappingService.getById(request.mappingId);
            if (!mapping) {
                throw new Error('映射不存在');
            }

            // 判断是否为MCP类型，且配置了MCP端点
            const isMcp = mapping.kind === 'mcp' && mapping.mcpEndpoint;
            
            if (isMcp) {
                // MCP协议处理：使用mcpEndpoint作为目标地址
                targetUrl = mapping.mcpEndpoint;
                
                // 如果mcpEndpoint包含路径，保留；否则使用原始路径
                try {
                    const endpointUrl = new URL(mapping.mcpEndpoint);
                    if (request.path && request.path !== '/') {
                        targetUrl = `${endpointUrl.origin}${endpointUrl.pathname}${request.path}`;
                    }
                } catch {
                    // 如果mcpEndpoint不是完整URL，直接使用
                    targetUrl = mapping.mcpEndpoint;
                }
                
                console.log('[Proxy] MCP →', { targetUrl, method: request.method, mappingId: request.mappingId });
            } else {
                // 普通API代理：使用originalUrl
                targetUrl = this.buildTargetUrl(request.originalUrl, request.path);
                console.log('[Proxy] API →', { targetUrl, method: request.method, mappingId: request.mappingId });
            }

            // 准备请求头（移除一些不需要的头部）
            let headers = this.prepareHeaders(request.headers);

            // 如果是MCP，合并mcpConnectionConfig中的headers
            if (isMcp && mapping.mcpConnectionConfig && typeof mapping.mcpConnectionConfig === 'object') {
                const config = mapping.mcpConnectionConfig as any;
                if (config.headers && typeof config.headers === 'object') {
                    Object.assign(headers, config.headers);
                }
                // 确保Content-Type为application/json（MCP使用JSON-RPC）
                if (!headers['Content-Type'] && !headers['content-type']) {
                    headers['Content-Type'] = 'application/json';
                }
            }

            // 准备请求体
            let requestBody = request.body;

            // 如果是MCP且有请求模板，构建JSON-RPC请求
            if (isMcp && mapping.mcpRequestBody && typeof mapping.mcpRequestBody === 'object') {
                const template = mapping.mcpRequestBody as any;
                
                // 构建JSON-RPC请求
                const jsonRpcRequest = {
                    jsonrpc: template.jsonrpc || '2.0',
                    method: template.method || 'tools/call',
                    params: template.params || {},
                    id: template.id || Math.floor(Math.random() * 1000000)
                };

                // 如果用户请求体中有参数，尝试合并
                if (requestBody && requestBody.trim()) {
                    try {
                        const userParams = JSON.parse(requestBody);
                        // 如果用户传的是完整JSON-RPC，直接使用
                        if (userParams.jsonrpc && userParams.method) {
                            requestBody = JSON.stringify(userParams);
                        } else {
                            // 否则合并到params中
                            jsonRpcRequest.params = { ...jsonRpcRequest.params, ...userParams };
                            requestBody = JSON.stringify(jsonRpcRequest);
                        }
                    } catch {
                        // 解析失败，使用模板
                        requestBody = JSON.stringify(jsonRpcRequest);
                    }
                } else {
                    // 没有用户请求体，使用模板
                    requestBody = JSON.stringify(jsonRpcRequest);
                }
            }

            // 准备请求选项
            const timeout = isMcp && mapping.mcpConnectionConfig && typeof mapping.mcpConnectionConfig === 'object'
                ? (mapping.mcpConnectionConfig as any).timeout || 60000
                : 60000;

            const fetchOptions: any = {
                method: request.method,
                headers,
                // 设置超时
                signal: AbortSignal.timeout(timeout)
            };

            // GET 和 HEAD 请求不应该有 body
            const methodsWithoutBody = ['GET', 'HEAD', 'OPTIONS'];
            if (!methodsWithoutBody.includes(request.method.toUpperCase()) && requestBody && requestBody.length > 0) {
                fetchOptions.body = requestBody;
            }

            // 执行代理请求
            const response = await fetch(targetUrl, fetchOptions);

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

            const result: ProxyResult = {
                data: responseData,
                status: response.status,
                headers: responseHeaders,
                callId,
                fingerprint
            };
            if (response.status >= 400) {
                console.warn('[Proxy] ⇐ 非2xx响应', { targetUrl, status: response.status, mappingId: request.mappingId });
            }
            return result;

        } catch (error: any) {
            // 提取更详细的错误信息
            let errorMessage = error?.message || 'unknown error';
            let errorCode = error?.code;
            let errorType = 'UNKNOWN';

            // 根据错误类型进行分类
            if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
                errorType = 'TIMEOUT';
                errorMessage = '请求超时';
            } else if (error?.code === 'ENOTFOUND' || error?.code === 'EAI_AGAIN') {
                errorType = 'DNS_ERROR';
                let hostname = '目标主机';
                try {
                    if (targetUrl) {
                        hostname = new URL(targetUrl).hostname;
                    }
                } catch {
                    // URL 解析失败，使用原始 URL
                    hostname = targetUrl || '目标主机';
                }
                errorMessage = `DNS 解析失败: 无法解析 ${hostname}`;
            } else if (error?.code === 'ECONNREFUSED') {
                errorType = 'CONNECTION_REFUSED';
                errorMessage = '连接被拒绝';
            } else if (error?.code === 'ECONNRESET') {
                errorType = 'CONNECTION_RESET';
                errorMessage = '连接被重置';
            } else if (error?.code === 'ETIMEDOUT') {
                errorType = 'TIMEOUT';
                errorMessage = '连接超时';
            } else if (error?.message?.includes('certificate') || error?.code === 'CERT_HAS_EXPIRED') {
                errorType = 'SSL_ERROR';
                errorMessage = 'SSL 证书错误';
            } else if (error?.message?.includes('fetch failed')) {
                errorType = 'NETWORK_ERROR';
                errorMessage = '网络请求失败，请检查目标服务器是否可访问';
            }

            const errorDetails = {
                message: errorMessage,
                code: errorCode,
                type: errorType,
                targetUrl,
                method: request.method,
                mappingId: request.mappingId,
                path: request.path,
                originalUrl: request.originalUrl,
                originalError: error?.message
            };

            console.error('代理请求失败:', errorDetails);

            return {
                data: {
                    error: '代理请求失败',
                    message: errorMessage,
                    type: errorType,
                    targetUrl,
                    method: request.method,
                    mappingId: request.mappingId,
                    path: request.path
                },
                status: 500,
                headers: {},
                callId,
                fingerprint: this.generateFingerprint({
                    url: request.originalUrl,
                    method: request.method,
                    status: 500,
                    timestamp: startTime
                }),
                error: errorMessage
            };
        }
    }

    private buildTargetUrl(originalUrl: string, path: string): string {
        const baseUrl = originalUrl.replace(/\/$/, ''); // 移除末尾斜杠
        
        // 如果 path 为空，直接返回 baseUrl
        if (!path || path.trim() === '') {
            return baseUrl;
        }
        
        // path 可能包含查询串（/foo?x=1），保持原样
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
