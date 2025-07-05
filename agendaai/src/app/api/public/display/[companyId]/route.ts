import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar dados do painel de display da empresa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params
    const company = await prisma.company.findUnique({
      where: { 
        id: companyId
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Buscar ticket em progresso (sendo atendido agora)
    const inProgressTickets = await prisma.ticket.findMany({
      where: {
        status: 'IN_PROGRESS',
        queue: {
          companyId: companyId
        }
      },
      include: {
        queue: {
          select: {
            name: true,
            prefix: true
          }
        }
      },
      orderBy: {
        calledAt: 'asc'
      }
    })

    // Buscar últimos tickets finalizados para histórico
    const recentFinishedTickets = await prisma.ticket.findMany({
      where: {
        status: 'DONE',
        queue: {
          companyId: companyId
        }
      },
      include: {
        queue: {
          select: {
            name: true,
            prefix: true
          }
        }
      },
      orderBy: {
        finishedAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json({
      company,
      currentTickets: inProgressTickets,
      recentTickets: recentFinishedTickets
    })
  } catch (error) {
    console.error('Erro ao buscar dados do painel:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}