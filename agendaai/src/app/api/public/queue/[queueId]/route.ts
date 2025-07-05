import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar dados públicos de uma fila específica
export async function GET(
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

    return NextResponse.json({
      id: queue.id,
      name: queue.name,
      prefix: queue.prefix,
      company: queue.company
    })
  } catch (error) {
    console.error('Erro ao buscar dados da fila:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}