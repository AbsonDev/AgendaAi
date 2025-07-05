import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// POST - Finalizar ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
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

    // Verificar se o ticket existe e pertence à empresa do usuário
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        queue: {
          companyId: user.companyId
        }
      },
      include: {
        queue: true
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
    }

    if (ticket.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Ticket não está em atendimento' }, { status: 400 })
    }

    // Atualizar o ticket para DONE
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'DONE',
        finishedAt: new Date()
      }
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Erro ao finalizar ticket:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}