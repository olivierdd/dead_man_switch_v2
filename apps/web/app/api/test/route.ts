import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'API is working',
        status: 'healthy',
        timestamp: new Date().toISOString()
    })
}

export async function POST(request: NextRequest) {
    return NextResponse.json({
        message: 'POST endpoint working',
        status: 'success',
        timestamp: new Date().toISOString()
    })
}
