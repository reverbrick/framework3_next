import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='flex flex-col space-y-4 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>Authentication Error</h1>
          <p className='text-sm text-muted-foreground'>
            There was a problem authenticating your account. Please try again.
          </p>
          <Link
            href='/auth/sign-in'
            className='text-sm font-medium text-primary hover:underline'
          >
            Return to Sign In
          </Link>
        </div>
      </Card>
    </AuthLayout>
  )
} 