import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const { toast } = useToast();
  // CORREÇÃO: Geralmente a função é 'logout'. Se seu contexto usar outro nome, ajuste aqui.
  const { user, logout } = useAuth(); 
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    senha: '',
    confirmSenha: '',
    department: user?.department || '',
    course: user?.course || ''
  });

  const courses = [
    { value: 'Ciencia da Computacao', label: 'Ciência da Computação' },
    { value: 'Engenharia de Software', label: 'Engenharia de Software' },
    { value: 'Sistemas de Informacao', label: 'Sistemas de Informação' },
    { value: 'Analise e Desenv. de Sistemas', label: 'Análise e Desenv. de Sistemas' },
    { value: 'Engenharia Civil', label: 'Engenharia Civil' },
    { value: 'Matematica', label: 'Matemática' },
    { value: 'Fisica', label: 'Física' },
    { value: 'Direito', label: 'Direito' },
    { value: 'Medicina', label: 'Medicina' },
    { value: 'Enfermagem', label: 'Enfermagem' },
    { value: 'Psicologia', label: 'Psicologia' },
    { value: 'Administracao', label: 'Administração' },
    { value: 'Contabilidade', label: 'Ciências Contábeis' },
    { value: 'Pedagogia', label: 'Pedagogia' }
  ];

  const departments = [
    { value: 1, label: 'Ciência da Computação' },
    { value: 2, label: 'Matemática' },
    { value: 3, label: 'Física' },
    { value: 4, label: 'Engenharia Civil' },
    { value: 5, label: 'Engenharia Elétrica' },
    { value: 6, label: 'Direito' },
    { value: 7, label: 'Administração' },
    { value: 8, label: 'Psicologia' },
    { value: 9, label: 'Biologia' },
    { value: 10, label: 'Química' },
  ];

  // --- ATUALIZAR DADOS ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.senha && formData.senha !== formData.confirmSenha) {
      toast({ title: 'Erro', description: 'Senhas não conferem.', variant: 'destructive' });
      return;
    }

    try {
      const baseURL = 'http://127.0.0.1:8000';
      const url = user?.type === 'professor'
          ? `${baseURL}/api/professor/${user.matricula}/update/`
          : `${baseURL}/api/students/${user.matricula}/update/`;

      const body: any = {
        nome: formData.name.trim() === '' ? user?.name : formData.name,
        email: formData.email.trim() === '' ? user?.email : formData.email
      };

      if (formData.senha) body.senha = formData.senha;

      if (user?.type === 'professor') {
        body.fk_cod_departamento = formData.department || user.department;
      } else {
        body.curso = formData.course || user?.course;
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error();

      toast({ title: 'Sucesso', description: 'Dados atualizados!', className: 'bg-green-600 text-white' });
      
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar dados.', variant: 'destructive' });
    }
  };

  // --- DELETAR CONTA ---
  const handleDeleteAccount = async () => {
    try {
        const baseURL = 'http://127.0.0.1:8000';
        const url = user?.type === 'professor'
            ? `${baseURL}/api/professor/${user.matricula}/delete/`
            : `${baseURL}/api/students/${user.matricula}/delete/`;

        const res = await fetch(url, { method: 'DELETE' });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Erro ao excluir");
        }

        toast({ title: 'Conta Excluída', description: 'Sua conta foi removida com sucesso.' });
        
        // CORREÇÃO: Usando logout() ao invés de signOut()
        if (logout) {
            logout();
        } else {
            // Fallback caso a função não exista no contexto (recarrega a pagina para limpar state)
            window.location.href = "/";
        }

    } catch (error: any) {
        console.error(error);
        toast({ title: 'Erro', description: error.message || 'Não foi possível excluir a conta.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-0 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seus dados pessoais</p>
      </div>

      {/* SEÇÃO 1: EDITAR DADOS */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Atualize suas informações cadastrais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" placeholder={user?.name} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder={user?.email} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="senha">Nova Senha</Label>
                    <Input id="senha" type="password" placeholder="Opcional" value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmSenha">Confirmar Senha</Label>
                    <Input id="confirmSenha" type="password" placeholder="Opcional" value={formData.confirmSenha} onChange={(e) => setFormData({ ...formData, confirmSenha: e.target.value })} />
                </div>
            </div>

            {user?.type === 'professor' ? (
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select value={formData.department ? String(formData.department) : undefined} onValueChange={(value) => setFormData({ ...formData, department: Number(value) })}>
                  <SelectTrigger id="department"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (<SelectItem key={dept.value} value={String(dept.value)}>{dept.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="course">Curso</Label>
                <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                  <SelectTrigger id="course"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (<SelectItem key={course.value} value={course.value}>{course.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end pt-2">
                <Button type="submit" className="gap-2 w-full md:w-auto">
                    <Save className="w-4 h-4" /> Salvar Alterações
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* SEÇÃO 2: ZONA DE PERIGO (EM BAIXO) */}
      <Card className="border-red-200 shadow-sm bg-red-50/10">
        <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5"/> Zona de Perigo
            </CardTitle>
            <CardDescription>Ações irreversíveis para sua conta</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-sm text-gray-600 max-w-xl">
                Ao excluir sua conta, todos os seus dados, incluindo histórico escolar, notas, matrículas e saldo do RU serão permanentemente removidos.
            </p>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full md:w-auto gap-2">
                        <Trash2 className="w-4 h-4" /> Excluir Minha Conta
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados dos nossos servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                            Sim, excluir conta
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;