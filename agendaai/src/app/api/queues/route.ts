import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET - Listar filas da empresa
export async function GET(request: NextRequest) {
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

    const queues = await prisma.queue.findMany({
      where: { companyId: user.companyId },
      include: {
        _count: {
          select: {
            tickets: {
              where: {
                status: 'WAITING'
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(queues)
  } catch (error) {
    console.error('Erro ao buscar filas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar nova fila
export async function POST(request: NextRequest) {
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

    const { name, prefix } = await request.json()

    if (!name || !prefix) {
      return NextResponse.json({ error: 'Nome e prefixo são obrigatórios' }, { status: 400 })
    }

    // Verificar se já existe uma fila com o mesmo prefixo na empresa
    const existingQueue = await prisma.queue.findFirst({
      where: {
        companyId: user.companyId,
        prefix: prefix.toUpperCase()
      }
    })

    if (existingQueue) {
      return NextResponse.json({ error: 'Já existe uma fila com este prefixo' }, { status: 400 })
    }

    const queue = await prisma.queue.create({
      data: {
        name,
        prefix: prefix.toUpperCase(),
        companyId: user.companyId
      },
      include: {
        _count: {
          select: {
            tickets: {
              where: {
                status: 'WAITING'
              }
            }
          }
        }
      }
    })

    return NextResponse.json(queue)
  } catch (error) {
    console.error('Erro ao criar fila:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}