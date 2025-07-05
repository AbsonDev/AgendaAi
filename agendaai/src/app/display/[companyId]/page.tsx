'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Company {
  id: string
  name: string
}

interface Ticket {
  id: string
  displayNumber: string
  status: string
  createdAt: string
  calledAt?: string
  finishedAt?: string
  queue: {
    name: string
    prefix: string
  }
}

interface DisplayData {
  company: Company
  currentTickets: Ticket[]
  recentTickets: Ticket[]
}

export default function DisplayPage() {
  const params = useParams()
  const companyId = params.companyId as string
  const [displayData, setDisplayData] = useState<DisplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flashNewTicket, setFlashNewTicket] = useState(false)
  const [lastCurrentTicket, setLastCurrentTicket] = useState<string | null>(null)

  const fetchDisplayData = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/display/${companyId}`)
      if (response.ok) {
        const data = await response.json()
        
        // Verificar se há nova senha sendo chamada
        const currentTicketId = data.currentTickets[0]?.id
        if (currentTicketId && currentTicketId !== lastCurrentTicket) {
          setFlashNewTicket(true)
          setLastCurrentTicket(currentTicketId)
          
          // Tocar som de alerta (se suportado pelo navegador)
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.value = 800
            oscillator.type = 'sine'
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.5)
          } catch (audioError) {
            console.log('Áudio não suportado:', audioError)
          }
          
          // Parar o flash após 3 segundos
          setTimeout(() => setFlashNewTicket(false), 3000)
        }
        
        setDisplayData(data)
        setError(null)
      } else {
        setError('Empresa não encontrada')
      }
    } catch (error) {
      console.error('Erro ao buscar dados do painel:', error)
      setError('Erro ao carregar dados do painel')
    } finally {
      setLoading(false)
    }
  }, [companyId, lastCurrentTicket])

  useEffect(() => {
    if (companyId) {
      fetchDisplayData()
    }
  }, [companyId, fetchDisplayData])

  // Polling para atualizar dados a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(fetchDisplayData, 3000)
    return () => clearInterval(interval)
  }, [fetchDisplayData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-2xl">Carregando painel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4">❌</div>
          <h1 className="text-4xl font-bold mb-4">Erro</h1>
          <p className="text-2xl">{error}</p>
        </div>
      </div>
    )
  }

  const currentTicket = displayData?.currentTickets[0]
  const recentTickets = displayData?.recentTickets || []

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white transition-all duration-300 ${
      flashNewTicket ? 'bg-gradient-to-br from-green-500 to-green-600' : ''
    }`}>
      {/* Header */}
      <div className="bg-black bg-opacity-50 p-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">
            {displayData?.company.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Painel de Senhas
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-screen">
        {/* Senha Atual */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-300">
              SENHA ATUAL
            </h2>
            
            {currentTicket ? (
              <div className={`bg-white bg-opacity-20 rounded-3xl p-8 md:p-12 backdrop-blur-sm transition-all duration-300 ${
                flashNewTicket ? 'scale-110 shadow-2xl' : ''
              }`}>
                <p className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4 text-yellow-300">
                  {currentTicket.displayNumber}
                </p>
                <p className="text-2xl md:text-3xl text-gray-300 mb-2">
                  {currentTicket.queue.name}
                </p>
                <p className="text-lg md:text-xl text-gray-400">
                  Chamado às {new Date(currentTicket.calledAt!).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            ) : (
              <div className="bg-white bg-opacity-20 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                <p className="text-4xl md:text-6xl font-bold mb-4 text-gray-400">
                  Aguardando...
                </p>
                <p className="text-xl md:text-2xl text-gray-500">
                  Nenhuma senha sendo chamada
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Histórico */}
        <div className="md:w-1/3 bg-black bg-opacity-30 p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            ÚLTIMAS SENHAS
          </h3>
          
          <div className="space-y-4">
            {recentTickets.length > 0 ? (
              recentTickets.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-gray-300">
                        {ticket.displayNumber}
                      </p>
                      <p className="text-sm md:text-base text-gray-400">
                        {ticket.queue.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm md:text-base text-gray-400">
                        {new Date(ticket.finishedAt!).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-xl text-gray-400">
                  Nenhuma senha atendida ainda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
        <div className="flex justify-between items-center text-sm md:text-base">
          <p className="text-gray-400">
            Agenda<span className="text-blue-400">Ai</span> - Sistema de Senhas
          </p>
          <p className="text-gray-400">
            Atualizado em {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}