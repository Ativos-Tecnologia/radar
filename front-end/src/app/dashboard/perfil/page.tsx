'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Camera, Save, X, Lock } from 'lucide-react';

interface UserProfile {
  id: string;
  nomeCompleto: string;
  email: string;
  departamento: string;
  role: string;
  fotoUrl: string | null;
}

interface PasswordForm {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

export default function PerfilPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    nomeCompleto: '',
    email: '',
    departamento: '',
    role: '',
    fotoUrl: null,
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        departamento: user.departamento || '',
        role: user.role,
        fotoUrl: user.fotoUrl || null,
      });
      setPreviewImage(user.fotoUrl || null);
    }
  }, [user]);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionar para máximo 400x400 mantendo proporção
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxSize = 400;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Converter para Base64 com qualidade reduzida
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(resizedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (max 5MB antes de redimensionar)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB' });
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Apenas imagens são permitidas' });
        return;
      }

      try {
        // Redimensionar imagem
        const resizedImage = await resizeImage(file);
        
        // Verificar tamanho da imagem Base64
        const sizeInBytes = resizedImage.length;
        const sizeInKB = Math.round(sizeInBytes / 1024);
        
        console.log(`Imagem redimensionada: ${sizeInKB}KB`);
        
        setPreviewImage(resizedImage);
        setFormData({ ...formData, fotoUrl: resizedImage });
        setMessage(null);
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
        setMessage({ type: 'error', text: 'Erro ao processar imagem' });
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData({ ...formData, fotoUrl: '' }); // Usar string vazia ao invés de null
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Construir objeto apenas com campos que devem ser atualizados
      const updateData: any = {
        nomeCompleto: formData.nomeCompleto,
      };

      if (formData.departamento) {
        updateData.departamento = formData.departamento;
      }

      if (formData.fotoUrl) {
        updateData.fotoUrl = formData.fotoUrl;
      }

      console.log('Enviando dados:', {
        ...updateData,
        fotoUrl: updateData.fotoUrl ? `${Math.round(updateData.fotoUrl.length / 1024)}KB` : 'sem foto'
      });

      const response = await api.updateUser(user!.id, updateData);

      // Atualizar contexto de autenticação
      updateUser(response);

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao atualizar perfil',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    setPasswordMessage(null);

    // Validações
    if (passwordForm.novaSenha.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'A nova senha deve ter no mínimo 6 caracteres',
      });
      setLoadingPassword(false);
      return;
    }

    if (passwordForm.novaSenha !== passwordForm.confirmarSenha) {
      setPasswordMessage({
        type: 'error',
        text: 'As senhas não coincidem',
      });
      setLoadingPassword(false);
      return;
    }

    try {
      await api.changePassword(user!.id, {
        senhaAtual: passwordForm.senhaAtual,
        novaSenha: passwordForm.novaSenha,
      });

      setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      
      // Limpar formulário
      setPasswordForm({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      });
    } catch (error: any) {
      setPasswordMessage({
        type: 'error',
        text: error.message || 'Erro ao alterar senha',
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meu Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Gerencie suas informações pessoais
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Foto de Perfil */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Foto de Perfil
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Foto de perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {formData.nomeCompleto.charAt(0).toUpperCase()}
                  </div>
                )}
                {previewImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Camera className="w-5 h-5" />
                  Escolher Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  JPG, PNG ou GIF. Máximo 5MB. A imagem será redimensionada automaticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informações Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) =>
                    setFormData({ ...formData, nomeCompleto: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) =>
                    setFormData({ ...formData, departamento: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Financeiro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Perfil
                </label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Apenas administradores podem alterar perfis
                </p>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        {/* Alteração de Senha */}
        <form onSubmit={handlePasswordSubmit} className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Alterar Senha
              </h2>
            </div>

            {passwordMessage && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha Atual *
                </label>
                <input
                  type="password"
                  value={passwordForm.senhaAtual}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, senhaAtual: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  value={passwordForm.novaSenha}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, novaSenha: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmarSenha}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmarSenha: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loadingPassword}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Lock className="w-5 h-5" />
                {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
