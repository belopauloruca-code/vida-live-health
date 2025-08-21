
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Shield, ShieldOff } from 'lucide-react';

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get profiles with user data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get auth users to get email and last sign in
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error loading auth users:', authError);
        // Continue with profile data only
        setUsers(profiles?.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: 'N/A',
          role: profile.role,
          created_at: profile.created_at,
        })) || []);
      } else {
        // Merge profile and auth data
        const mergedUsers = profiles?.map(profile => {
          const authUser = authUsers.users.find(u => u.id === profile.id);
          return {
            id: profile.id,
            name: profile.name,
            email: authUser?.email || 'N/A',
            role: profile.role,
            created_at: profile.created_at,
            last_sign_in_at: authUser?.last_sign_in_at,
          };
        }) || [];
        
        setUsers(mergedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      // Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update user_roles table
      if (newRole === 'admin') {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
      } else {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
      }

      toast({
        title: "Papel atualizado!",
        description: `Usuário ${newRole === 'admin' ? 'promovido a' : 'removido de'} administrador`,
      });

      loadUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-600">Gerencie usuários e permissões do sistema</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Registrados ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista completa de usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Data de Registro</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || 'Sem nome'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={user.role === 'admin' ? 'outline' : 'default'}
                      onClick={() => toggleUserRole(user.id, user.role || 'user')}
                      className={user.role === 'admin' 
                        ? 'border-red-200 text-red-600 hover:bg-red-50' 
                        : ''
                      }
                    >
                      {user.role === 'admin' ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Revogar Admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          Tornar Admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
