import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    senha: '',
    confirmSenha: '',
    department: user?.department || '',
    course: user?.course || ''
  });

  const departments = [
    { value: 'computacao', label: 'Computação' },
    { value: 'matematica', label: 'Matemática' },
    { value: 'fisica', label: 'Física' },
    { value: 'quimica', label: 'Química' },
    { value: 'engenharia', label: 'Engenharia' }
  ];

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmSenha) {
      toast({
        title: 'Erro',
        description: 'A senha e a confirmação da senha não coincidem.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Base URL do backend
      const baseURL = 'http://127.0.0.1:8000';
      const url =
        user?.type === 'professor'
          ? `${baseURL}/api/professors/${user.matricula}/update/`
          : `${baseURL}/api/students/${user.matricula}/update/`;

      const body: any = {
        nome: formData.name,
        email: formData.email
      };

      if (formData.senha) body.senha = formData.senha;

      if (user?.type === 'professor') body.departamento = formData.department;
      else body.curso = formData.course;

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: 'Erro inesperado do servidor' };
      }

      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar dados');

      toast({
        title: 'Sucesso',
        description: 'Dados atualizados com sucesso!'
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seus dados pessoais</p>
      </div>

      <Card className="shadow-card max-w-2xl">
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

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              />
            </div>

            {/* Confirmação de Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmSenha">Confirmar Senha</Label>
              <Input
                id="confirmSenha"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmSenha}
                onChange={(e) => setFormData({ ...formData, confirmSenha: e.target.value })}
              />
            </div>

            {/* Professor ou Aluno */}
            {user?.type === 'professor' ? (
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="course">Curso</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData({ ...formData, course: value })}
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.value} value={course.value}>
                        {course.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full gap-2">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
