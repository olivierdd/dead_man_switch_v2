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
        // Check if Supabase environment variables are set
        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables')
            return NextResponse.json(
                { detail: 'Server configuration error' },
                { status: 500 }
            )
        }

        const body = await request.json()
        console.log('Registration request body:', body)
        const { email, password, first_name, last_name, display_name, role = 'writer' } = body

        // Validate required fields
        if (!email || !password || !first_name || !last_name || !display_name) {
            console.log('Missing required fields:', { email: !!email, password: !!password, first_name: !!first_name, last_name: !!last_name, display_name: !!display_name })
            return NextResponse.json(
                { detail: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate password strength
        if (password.length < 12) {
            return NextResponse.json(
                { detail: 'Password must be at least 12 characters' },
                { status: 400 }
            )
        }

        // Check if user already exists
        console.log('Checking if user exists for email:', email)
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single()

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing user:', checkError)
            return NextResponse.json(
                { detail: 'Database error' },
                { status: 500 }
            )
        }

        if (existingUser) {
            console.log('User already exists')
            return NextResponse.json(
                { detail: 'Email already registered' },
                { status: 400 }
            )
        }

        // Create user in Supabase Auth
        console.log('Creating user in Supabase Auth')
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name,
                    last_name,
                    display_name,
                    role
                }
            }
        })

        if (authError) {
            console.error('Auth error:', authError)
            console.error('Auth error details:', {
                message: authError.message,
                status: authError.status,
                statusText: authError.statusText
            })
            
            // Handle specific Supabase auth errors
            if (authError.message.includes('Invalid email')) {
                return NextResponse.json(
                    { detail: 'Please enter a valid email address' },
                    { status: 400 }
                )
            }
            
            return NextResponse.json(
                { detail: authError.message },
                { status: 400 }
            )
        }

        if (!authData.user) {
            return NextResponse.json(
                { detail: 'Failed to create user' },
                { status: 500 }
            )
        }

        // Create user profile in your users table
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: authData.user.email,
                first_name,
                last_name,
                display_name,
                role,
                is_verified: false,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't fail the registration if profile creation fails
            // The user can still be created in auth
        }

        return NextResponse.json({
            id: authData.user.id,
            email: authData.user.email,
            display_name,
            role,
            is_active: true,
            created_at: new Date().toISOString(),
            subscription_tier: 'free'
        })

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
        )
    }
}
