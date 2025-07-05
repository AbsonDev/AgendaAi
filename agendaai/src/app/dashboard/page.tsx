'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  company: {
    id: string
    name: string
  }
}

interface Queue {
  id: string
  name: string
  prefix: string
  currentNumber: number
  _count: {
    tickets: number
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [queues, setQueues] = useState<Queue[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newQueue, setNewQueue] = useState({ name: '', prefix: 'A' })
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, queuesResponse] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/queues')
        ])

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
        } else {
          router.push('/login')
          return
        }

        if (queuesResponse.ok) {
          const queuesData = await queuesResponse.json()
          setQueues(queuesData)
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQueue),
      })

      if (response.ok) {
        const queue = await response.json()
        setQueues([...queues, queue])
        setShowCreateModal(false)
        setNewQueue({ name: '', prefix: 'A' })
      } else {
        console.error('Erro ao criar fila')
      }
    } catch (error) {
      console.error('Erro ao criar fila:', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Agenda<span className="text-blue-600">Ai</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Bem-vindo, {user?.company.name}!
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Você está conectado ao painel administrativo do AgendaAi
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Próximos Passos</h4>
                    <p className="text-sm opacity-90">
                      Configure suas filas e comece a gerenciar seus atendimentos
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Filas Criadas</h4>
                    <p className="text-2xl font-bold">{queues.length}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                    <h4 className="text-lg font-semibold mb-2">Usuários</h4>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Filas */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Minhas Filas</h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
                >
                  Criar Nova Fila
                </button>
              </div>

              {queues.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhuma fila criada ainda.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
                  >
                    Criar Primeira Fila
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {queues.map((queue) => (
                    <Link
                      key={queue.id}
                      href={`/dashboard/queues/${queue.id}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-300 hover:border-blue-300"
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {queue.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Prefixo: {queue.prefix}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Próximo número: {queue.currentNumber + 1}
                      </p>
                      <p className="text-sm text-gray-600">
                        Senhas na fila: {queue._count?.tickets || 0}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal para Criar Nova Fila */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Criar Nova Fila
            </h3>
            <form onSubmit={handleCreateQueue}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Fila
                </label>
                <input
                  type="text"
                  value={newQueue.name}
                  onChange={(e) => setNewQueue({ ...newQueue, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Atendimento Preferencial"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prefixo da Senha
                </label>
                <input
                  type="text"
                  value={newQueue.prefix}
                  onChange={(e) => setNewQueue({ ...newQueue, prefix: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: P"
                  maxLength={2}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 disabled:opacity-50"
                >
                  {creating ? 'Criando...' : 'Criar Fila'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}