'use client'

import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'
import Link from 'next/link'

export default function ResetPassword() {
  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-2 flex flex-col space-y-2 text-left'>
          <h1 className='text-md font-semibold tracking-tight'>
            Reset Password
          </h1>
          <p className='text-sm text-muted-foreground'>
            Enter your new password below.
          </p>
        </div>
        <ResetPasswordForm />
        <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
          Remember your password?{' '}
          <Link
            href='/auth/sign-in'
            className='underline underline-offset-4 hover:text-primary'
          >
            Sign in
          </Link>
          .
        </p>
      </Card>
    </AuthLayout>
  )
} 