import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET - Buscar dados de uma fila específica
export async function GET(
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

    const waitingTickets = await prisma.ticket.findMany({
      where: {
        queueId: params.queueId,
        status: 'WAITING'
      },
      orderBy: { createdAt: 'asc' }
    })

    const inProgressTickets = await prisma.ticket.findMany({
      where: {
        queueId: params.queueId,
        status: 'IN_PROGRESS'
      },
      orderBy: { calledAt: 'asc' }
    })

    return NextResponse.json({
      queue,
      waitingTickets,
      inProgressTickets
    })
  } catch (error) {
    console.error('Erro ao buscar dados da fila:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}