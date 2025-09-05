import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, password } = body

        // Validate required fields
        if (!username || !password) {
            return NextResponse.json(
                { detail: 'Username and password are required' },
                { status: 400 }
            )
        }

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: username,
            password
        })

        if (authError) {
            console.error('Auth error:', authError)
            return NextResponse.json(
                { detail: 'Incorrect email or password' },
                { status: 401 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { detail: 'Failed to authenticate user' },
                { status: 401 }
            )
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
            .from('user')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (profileError) {
            console.error('Profile fetch error:', profileError)
            // Return basic user data if profile fetch fails
            return NextResponse.json({
                access_token: authData.session?.access_token || '',
                refresh_token: authData.session?.refresh_token || '',
                token_type: 'bearer',
                expires_in: authData.session?.expires_in || 3600,
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    display_name: authData.user.user_metadata?.display_name || '',
                    role: authData.user.user_metadata?.role || 'writer',
                    is_verified: authData.user.email_confirmed_at ? true : false
                }
            })
        }

        return NextResponse.json({
            access_token: authData.session?.access_token || '',
            refresh_token: authData.session?.refresh_token || '',
            token_type: 'bearer',
            expires_in: authData.session?.expires_in || 3600,
            user: {
                id: authData.user.id,
                email: authData.user.email,
                display_name: userProfile.display_name,
                role: userProfile.role,
                is_verified: userProfile.is_verified
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
        )
    }
}
