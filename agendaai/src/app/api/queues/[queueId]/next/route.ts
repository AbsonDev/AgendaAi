import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// POST - Chamar próximo ticket da fila
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  try {
    const { queueId } = await params
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
        id: queueId,
        companyId: user.companyId
      }
    })

    if (!queue) {
      return NextResponse.json({ error: 'Fila não encontrada' }, { status: 404 })
    }

    // Buscar o próximo ticket em espera
    const nextTicket = await prisma.ticket.findFirst({
      where: {
        queueId: queueId,
        status: 'WAITING'
      },
      orderBy: { createdAt: 'asc' }
    })

    if (!nextTicket) {
      return NextResponse.json({ error: 'Nenhum ticket aguardando' }, { status: 400 })
    }

    // Atualizar o ticket para IN_PROGRESS
    const updatedTicket = await prisma.ticket.update({
      where: { id: nextTicket.id },
      data: {
        status: 'IN_PROGRESS',
        calledAt: new Date()
      }
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Erro ao chamar próximo ticket:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}