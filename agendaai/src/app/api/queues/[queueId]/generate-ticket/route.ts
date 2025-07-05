import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// POST - Gerar novo ticket para a fila
export async function POST(
  request: NextRequest,
  { params }: { params: { queueId: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const queue = await prisma.queue.findFirst({
      where: { 
        id: params.queueId,
        companyId: user.companyId
      }
    })

    if (!queue) {
      return NextResponse.json({ error: 'Fila não encontrada' }, { status: 404 })
    }

    // Atualizar o currentNumber da fila e criar o ticket em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Incrementar o currentNumber da fila
      const updatedQueue = await tx.queue.update({
        where: { id: params.queueId },
        data: {
          currentNumber: queue.currentNumber + 1
        }
      })

      // Criar o novo ticket
      const newTicket = await tx.ticket.create({
        data: {
          displayNumber: `${queue.prefix}${String(updatedQueue.currentNumber).padStart(3, '0')}`,
          queueId: params.queueId,
          status: 'WAITING'
        }
      })

      return { queue: updatedQueue, ticket: newTicket }
    })

    return NextResponse.json(result.ticket)
  } catch (error) {
    console.error('Erro ao gerar novo ticket:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}