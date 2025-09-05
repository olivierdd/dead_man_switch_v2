import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
    try {
        console.log('Testing Supabase connection...')
        console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
        console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                error: 'Missing Supabase environment variables',
                supabaseUrl: !!supabaseUrl,
                supabaseKey: !!supabaseKey
            }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Test basic connection
        const { data, error } = await supabase
            .from('user')
            .select('count')
            .limit(1)

        if (error) {
            console.error('Supabase connection error:', error)
            return NextResponse.json({
                error: 'Supabase connection failed',
                details: error.message,
                code: error.code
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Supabase connection successful',
            supabaseUrl: supabaseUrl.substring(0, 20) + '...',
            supabaseKey: supabaseKey.substring(0, 10) + '...'
        })

    } catch (error) {
        console.error('Test error:', error)
        return NextResponse.json({
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
