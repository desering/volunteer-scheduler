'use client'

import { register } from '@/actions/auth/register'
import { redirect } from 'next/navigation'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { css, cx } from 'styled-system/css'
import { HStack, panda } from 'styled-system/jsx'
import { vstack } from 'styled-system/patterns'
import { button, input, link } from 'styled-system/recipes'

const initialState = {
  message: '',
  success: false,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className={cx(button({ size: 'lg', variant: 'solid' }), css({ flexGrow: 1 }))}
    >
      Register
    </button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, initialState)

  if (state.success) {
    redirect('/')
  }

  return (
    <form action={formAction} className={vstack({ alignItems: 'stretch' })}>
      {state?.message ? (
        <panda.div
          className={css({
            color: 'gray.1',
            backgroundColor: 'tomato',
            paddingX: '4',
            paddingY: '2',
          })}
        >
          <p>{state?.message}</p>
        </panda.div>
      ) : (
        ''
      )}

      <panda.div width="full">
        <label htmlFor="preferredName">Preferred Name:</label>
        <input
          type="text"
          id="preferredName"
          name="preferredName"
          required
          className={input({
            size: 'lg',
          })}
        />
        <p>This will be visible to everyone</p>
      </panda.div>

      <panda.div width="full">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={input({
            size: 'lg',
          })}
        />
      </panda.div>

      <panda.div width="full">
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          required
          className={input({
            size: 'lg',
          })}
        />
      </panda.div>

      <panda.div width="full">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className={input({
            size: 'lg',
          })}
        />
      </panda.div>

      <panda.div width="full">
        <label htmlFor="password">Confirm Password:</label>
        <input
          type="password"
          id="passwordAgain"
          name="passwordAgain"
          required
          className={input({
            size: 'lg',
          })}
        />
      </panda.div>

      <HStack>
        <a
          type="button"
          href="/"
          className={cx(button({ size: 'lg', variant: 'outline' }), css({ flexGrow: 1 }))}
        >
          Cancel
        </a>
        <SubmitButton />
      </HStack>

      <div className={css({ textAlign: 'center', marginY: '10px' })}>
        Already have an account?{' '}
        <a href="/auth/login" className={link()}>
          Login
        </a>
      </div>
    </form>
  )
}
