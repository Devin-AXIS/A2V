import { NextRequest, NextResponse } from 'next/server';
import { disconnectMCP } from '@/lib/mcp-client';
import { isProxyConnection } from '@/lib/proxy-client';

export async function POST(request: NextRequest) {
  try {
    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: '缺少connectionId参数' },
        { status: 400 }
      );
    }

    // 检查是否是代理连接
    if (isProxyConnection(connectionId)) {
      // 代理连接的断开由SSE会话管理，这里只返回成功
      console.log(`[Disconnect] 代理连接断开请求: ${connectionId}（由SSE会话管理）`);
      return NextResponse.json({
        success: true,
        message: '代理连接断开请求已处理（连接由SSE会话管理）',
      });
    }

    await disconnectMCP(connectionId);

    return NextResponse.json({
      success: true,
      message: '连接已断开',
    });
  } catch (error: any) {
    console.error('断开连接失败:', error);
    return NextResponse.json(
      {
        error: '断开连接失败',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
