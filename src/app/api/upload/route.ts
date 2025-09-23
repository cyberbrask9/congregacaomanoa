import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 });
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 5MB)' }, { status: 400 });
    }

    // Converter para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar diretório se não existir
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Nome único para o arquivo
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `projeto-${timestamp}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Salvar arquivo
    await writeFile(filepath, buffer);

    // Retornar URL da imagem
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Adicionar método OPTIONS para CORS (opcional, mas recomendado)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Se quiser permitir GET para teste, adicione isso (opcional):
export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST para fazer upload de arquivos',
    supported_types: ['image/png', 'image/jpeg', 'image/jpg'],
    max_size: '5MB'
  }, { status: 200 });
}