// Sistema para evitar repetição de imagens baseado em hash e rotação
export class UniqueImageSystem {
  private static usedImages = new Map<string, Set<string>>();
  private static imageRotation = new Map<string, number>();

  // Gera um hash simples baseado no conteúdo
  private static generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Pool de imagens por categoria
  private static imagePools = {
    cardio: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&q=80',
      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
      'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=800&q=80'
    ],
    strength: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
      'https://images.unsplash.com/photo-1583500178690-f7d24f6bd1f3?w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&q=80',
      'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=800&q=80'
    ],
    flexibility: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80',
      'https://images.unsplash.com/photo-1506629905607-24b52cc23e51?w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=800&q=80'
    ],
    yoga: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      'https://images.unsplash.com/photo-1506629905607-24b52cc23e51?w=800&q=80',
      'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80',
      'https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=800&q=80',
      'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80'
    ],
    general: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&q=80'
    ]
  };

  // Mapeia categoria para pool de imagens
  private static getCategoryPool(category: string): string[] {
    const normalizedCategory = category.toLowerCase();
    if (normalizedCategory.includes('cardio')) return this.imagePools.cardio;
    if (normalizedCategory.includes('força')) return this.imagePools.strength;
    if (normalizedCategory.includes('flexibilidade')) return this.imagePools.flexibility;
    if (normalizedCategory.includes('yoga')) return this.imagePools.yoga;
    return this.imagePools.general;
  }

  // Obtém uma imagem única para um contexto específico
  static getUniqueImage(context: string, category: string, identifier: string): string {
    const contextKey = `${context}_${category}`;
    const contentHash = this.generateHash(`${identifier}_${category}`);
    
    // Inicializa o conjunto de imagens usadas para este contexto se não existir
    if (!this.usedImages.has(contextKey)) {
      this.usedImages.set(contextKey, new Set());
      this.imageRotation.set(contextKey, 0);
    }

    const usedSet = this.usedImages.get(contextKey)!;
    const pool = this.getCategoryPool(category);
    
    // Se todas as imagens foram usadas, reset o conjunto
    if (usedSet.size >= pool.length) {
      usedSet.clear();
      this.imageRotation.set(contextKey, 0);
    }

    // Encontra uma imagem não usada
    let rotationIndex = this.imageRotation.get(contextKey) || 0;
    let selectedImage = pool[rotationIndex % pool.length];
    
    // Se a imagem já foi usada, procura a próxima disponível
    while (usedSet.has(selectedImage) && usedSet.size < pool.length) {
      rotationIndex = (rotationIndex + 1) % pool.length;
      selectedImage = pool[rotationIndex];
    }

    // Marca a imagem como usada e atualiza o índice de rotação
    usedSet.add(selectedImage);
    this.imageRotation.set(contextKey, (rotationIndex + 1) % pool.length);

    return selectedImage;
  }

  // Reset do sistema para um contexto específico
  static resetContext(context: string, category?: string): void {
    if (category) {
      const contextKey = `${context}_${category}`;
      this.usedImages.delete(contextKey);
      this.imageRotation.delete(contextKey);
    } else {
      // Reset de todos os contextos que começam com o contexto especificado
      for (const key of this.usedImages.keys()) {
        if (key.startsWith(context)) {
          this.usedImages.delete(key);
          this.imageRotation.delete(key);
        }
      }
    }
  }

  // Obtém estatísticas de uso
  static getUsageStats(context: string): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [key, usedSet] of this.usedImages.entries()) {
      if (key.startsWith(context)) {
        const category = key.split('_')[1];
        stats[category] = usedSet.size;
      }
    }
    return stats;
  }
}