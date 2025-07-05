'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface QueueInfo {
  id: string
  name: string
  prefix: string
  company: {
    id: string
    name: string
  }
}

interface TicketResponse {
  ticket: {
    id: string
    displayNumber: string
    status: string
    createdAt: string
  }
  queueName: string
  companyName: string
}

export default function GetTicketPage() {
  const params = useParams()
  const queueId = params.queueId as string
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [ticket, setTicket] = useState<TicketResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQueueInfo = async () => {
      try {
        const response = await fetch(`/api/public/queue/${queueId}`)
        if (response.ok) {
          const data = await response.json()
          setQueueInfo(data)
        } else {
          setError('Fila não encontrada')
        }
      } catch (error) {
        console.error('Erro ao buscar dados da fila:', error)
        setError('Erro ao carregar dados da fila')
      } finally {
        setLoading(false)
      }
    }

    if (queueId) {
      fetchQueueInfo()
    }
  }, [queueId])

  const handleGenerateTicket = async () => {
    if (!queueInfo) return

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/public/queue/${queueId}/generate-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTicket(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao gerar senha')
      }
    } catch (error) {
      console.error('Erro ao gerar ticket:', error)
      setError('Erro ao gerar senha')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error && !queueInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Senha Gerada com Sucesso!
            </h1>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Sua senha é:</p>
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {ticket.ticket.displayNumber}
              </p>
              <p className="text-sm text-gray-600">
                Fila: {ticket.queueName}
              </p>
              <p className="text-sm text-gray-600">
                {ticket.companyName}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                💡 Acompanhe o painel para ser chamado
              </p>
            </div>
            <button
              onClick={() => {
                setTicket(null)
                setError(null)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Gerar Nova Senha
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-blue-600 text-6xl mb-4">🎫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {queueInfo?.company.name}
          </h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            {queueInfo?.name}
          </h2>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-blue-800 mb-2">
              Clique no botão abaixo para retirar sua senha
            </p>
            <p className="text-xs text-blue-600">
              Prefixo da fila: {queueInfo?.prefix}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerateTicket}
            disabled={generating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg text-lg transition duration-300 transform hover:scale-105"
          >
            {generating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Gerando...
              </div>
            ) : (
              'Pegar minha Senha'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}