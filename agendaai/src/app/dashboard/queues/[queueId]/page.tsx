'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Queue {
  id: string
  name: string
  prefix: string
  currentNumber: number
}

interface Ticket {
  id: string
  displayNumber: string
  status: string
  createdAt: string
  calledAt?: string
}

export default function QueueManagement() {
  const [queue, setQueue] = useState<Queue | null>(null)
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([])
  const [inProgressTickets, setInProgressTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [calling, setCalling] = useState(false)
  const [finishing, setFinishing] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const queueId = params.queueId as string

  useEffect(() => {
    fetchQueueData()
    
    // Polling para atualizar a tela a cada 5 segundos
    const interval = setInterval(fetchQueueData, 5000)
    
    return () => clearInterval(interval)
  }, [queueId])

  const fetchQueueData = async () => {
    try {
      const response = await fetch(`/api/queues/${queueId}`)
      if (response.ok) {
        const data = await response.json()
        setQueue(data.queue)
        setWaitingTickets(data.waitingTickets)
        setInProgressTickets(data.inProgressTickets)
      } else if (response.status === 404) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao buscar dados da fila:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCallNext = async () => {
    setCalling(true)
    try {
      const response = await fetch(`/api/queues/${queueId}/next`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchQueueData()
      } else {
        console.error('Erro ao chamar próximo')
      }
    } catch (error) {
      console.error('Erro ao chamar próximo:', error)
    } finally {
      setCalling(false)
    }
  }

  const handleFinishTicket = async (ticketId: string) => {
    setFinishing(ticketId)
    try {
      const response = await fetch(`/api/tickets/${ticketId}/finish`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchQueueData()
      } else {
        console.error('Erro ao finalizar atendimento')
      }
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error)
    } finally {
      setFinishing(null)
    }
  }

  const generateNewTicket = async () => {
    try {
      const response = await fetch(`/api/queues/${queueId}/generate-ticket`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchQueueData()
      } else {
        console.error('Erro ao gerar nova senha')
      }
    } catch (error) {
      console.error('Erro ao gerar nova senha:', error)
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
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Voltar
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                {queue?.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Prefixo: {queue?.prefix}
              </span>
              <span className="text-sm text-gray-600">
                Próximo: {queue?.prefix}{String((queue?.currentNumber || 0) + 1).padStart(3, '0')}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Controles */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Controles da Fila
                </h3>
                
                <div className="space-y-4">
                  <button
                    onClick={handleCallNext}
                    disabled={calling || waitingTickets.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg text-lg font-semibold transition duration-300"
                  >
                    {calling ? 'Chamando...' : 'Chamar Próximo'}
                  </button>
                  
                  <button
                    onClick={generateNewTicket}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300"
                  >
                    Gerar Nova Senha
                  </button>
                  
                  <div className="text-center text-sm text-gray-600">
                    {waitingTickets.length === 0 && (
                      <p>Nenhuma senha aguardando</p>
                    )}
                    {waitingTickets.length > 0 && (
                      <p>{waitingTickets.length} senha(s) aguardando</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Em Atendimento */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Em Atendimento
                </h3>
                
                {inProgressTickets.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum atendimento em andamento
                  </p>
                ) : (
                  <div className="space-y-3">
                    {inProgressTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {ticket.displayNumber}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Chamado às {new Date(ticket.calledAt!).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleFinishTicket(ticket.id)}
                          disabled={finishing === ticket.id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
                        >
                          {finishing === ticket.id ? 'Finalizando...' : 'Finalizar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Senhas Aguardando */}
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Senhas Aguardando
              </h3>
              
              {waitingTickets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma senha aguardando
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {waitingTickets.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className={`border rounded-lg p-4 text-center ${
                        index === 0
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <h4 className="text-lg font-semibold text-gray-900">
                        {ticket.displayNumber}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {new Date(ticket.createdAt).toLocaleTimeString()}
                      </p>
                      {index === 0 && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          Próximo
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}