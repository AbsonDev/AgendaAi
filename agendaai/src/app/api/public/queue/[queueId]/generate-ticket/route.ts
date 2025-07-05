import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// POST - Gerar novo ticket para a fila (público)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  try {
    const { queueId } = await params
    const queue = await prisma.queue.findUnique({
      where: { 
        id: queueId
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!queue) {
      return NextResponse.json({ error: 'Fila não encontrada' }, { status: 404 })
    }

    // Atualizar o currentNumber da fila e criar o ticket em uma transação
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Incrementar o currentNumber da fila
      const updatedQueue = await tx.queue.update({
        where: { id: queueId },
        data: {
          currentNumber: queue.currentNumber + 1
        }
      })

      // Criar o novo ticket
      const newTicket = await tx.ticket.create({
        data: {
          displayNumber: `${queue.prefix}${String(updatedQueue.currentNumber).padStart(3, '0')}`,
          queueId: queueId,
          status: 'WAITING'
        }
      })

      return { queue: updatedQueue, ticket: newTicket }
    })

    return NextResponse.json({
      ticket: result.ticket,
      queueName: queue.name,
      companyName: queue.company.name
    })
  } catch (error) {
    console.error('Erro ao gerar novo ticket:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}