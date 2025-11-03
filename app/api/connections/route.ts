import { NextResponse } from 'next/server';
import { activeClients } from '@/lib/mcp-client';

export async function GET() {
  return NextResponse.json({
    success: true,
    connections: Array.from(activeClients.keys()),
  });
}
