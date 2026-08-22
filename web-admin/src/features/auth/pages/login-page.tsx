import { Helmet } from 'react-helmet-async'

import { AuthLayout } from '../layouts/auth-layout'

import { LoginForm } from '../components/login-form'

export function LoginPage() {
  return (
    <>
      <Helmet>
        <title>
          U.E.C.G. | Sistema Escolar
        </title>

        <meta
          name="description"
          content="Plataforma de gestión escolar"
        />
      </Helmet>

      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  )
}
