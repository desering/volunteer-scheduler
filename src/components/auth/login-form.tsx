'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { css, cx } from 'styled-system/css'
import { HStack, panda } from 'styled-system/jsx'
import { vstack } from 'styled-system/patterns'
import { button, input, link } from 'styled-system/recipes'
import { Button } from '../ui/button'

const initialState = {
  message: '',
  success: false,
}

export const LoginForm = () => {
  const router = useRouter()

  const { isPending, error, mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/payload-api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message)
      }

      router.push('/')
    },
  })

  return (
    <form action={mutate} className={vstack({ alignItems: 'stretch' })}>
      {error?.message && (
        <panda.div
          className={css({
            color: 'gray.1',
            backgroundColor: 'tomato',
            paddingX: '4',
            paddingY: '2',
          })}
        >
          <p>{error?.message}</p>
        </panda.div>
      )}

      <panda.div width="full">
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required className={input({ size: 'lg' })} />
      </panda.div>

      <panda.div width="full">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className={input({ size: 'lg' })}
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
        <Button
          type="submit"
          disabled={isPending}
          className={cx(button({ size: 'lg', variant: 'solid' }), css({ flexGrow: 1 }))}
        >
          Login
        </Button>
      </HStack>

      <panda.div textAlign="center" marginY="10px">
        Don't have an account yet?{' '}
        <a href="/auth/register" className={link()}>
          Register
        </a>
      </panda.div>
    </form>
  )
}
