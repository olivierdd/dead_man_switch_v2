import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { detail: 'Authorization header required' },
                { status: 401 }
            )
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Verify the token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json(
                { detail: 'Invalid or expired token' },
                { status: 401 }
            )
        }

            // Get user profile from your user table
    const { data: userProfile, error: profileError } = await supabase
        .from('user')
        .select('*')
        .eq('id', user.id)
        .single()

        if (profileError) {
            console.error('Profile fetch error:', profileError)
            // Return basic user data if profile fetch fails
            return NextResponse.json({
                id: user.id,
                email: user.email,
                display_name: user.user_metadata?.display_name || '',
                role: user.user_metadata?.role || 'writer',
                is_active: true,
                created_at: user.created_at,
                subscription_tier: 'free'
            })
        }

        return NextResponse.json({
            id: userProfile.id,
            email: userProfile.email,
            display_name: userProfile.display_name,
            role: userProfile.role,
            is_active: userProfile.is_active,
            created_at: userProfile.created_at,
            last_check_in: userProfile.last_check_in,
            subscription_tier: userProfile.subscription_tier || 'free',
            avatar_url: userProfile.avatar_url,
            bio: userProfile.bio
        })

    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
        )
    }
}
