import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/mcp-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> | { connectionId: string } }
) {
  try {
    // 处理 Next.js 15 中 params 可能是 Promise 的情况
    const resolvedParams = params instanceof Promise ? await params : params;
    const { connectionId } = resolvedParams;
    
    if (!connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 connectionId 参数',
        },
        { status: 400 }
      );
    }
    
    const client = getClient(connectionId);
    const resources = await client.listResources();

    return NextResponse.json({
      success: true,
      resources: resources.resources || [],
    });
  } catch (error: any) {
    console.error('获取资源列表失败:', error);
    
    // MCP 错误码 -32601 表示 "Method not found"，说明服务器不支持此功能
    // 这是正常情况，返回空列表而不是错误
    if (error.code === -32601 || error.message?.includes('Method not found')) {
      console.log('MCP 服务器不支持 resources 功能，返回空列表');
      return NextResponse.json({
        success: true,
        resources: [],
        message: '该 MCP 服务器不支持资源功能',
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: '获取资源列表失败',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
