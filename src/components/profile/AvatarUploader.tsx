
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  userName?: string;
  onAvatarUpdate: (newUrl: string) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  userName,
  onAvatarUpdate,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
      });
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Erro", 
        description: "A imagem deve ter no máximo 2MB.",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Criar preview local
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Fazer upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = data.publicUrl;

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onAvatarUpdate(newAvatarUrl);
      setPreviewUrl(null);

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setPreviewUrl(null);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload da imagem.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage 
            src={previewUrl || currentAvatarUrl} 
            alt={userName} 
          />
          <AvatarFallback className="bg-green-100 text-green-600 text-xl">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium">{userName || 'Usuário'}</h3>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={handleFileSelect}
          disabled={uploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          {uploading ? 'Enviando...' : 'Alterar Foto'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
