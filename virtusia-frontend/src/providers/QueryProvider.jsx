import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

const QueryProvider = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configurações padrão para queries
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          // Não tentar novamente para erros 4xx
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          // Tentar até 3 vezes para outros erros
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Configurações padrão para mutations
        retry: false,
        onError: (error) => {
          console.error('Mutation error:', error)
        }
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Mostrar devtools apenas em desenvolvimento */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}

export default QueryProvider

