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
    cpf: user?.cpf || '',
    email: user?.email || '',
    department: user?.department || '',
    course: user?.course || ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Dados atualizados com sucesso!',
      description: 'Suas informações pessoais foram salvas.',
    });
  };

  const departments = [
    { value: 'computacao', label: 'Computação' },
    { value: 'matematica', label: 'Matemática' },
    { value: 'fisica', label: 'Física' },
    { value: 'quimica', label: 'Química' },
    { value: 'engenharia', label: 'Engenharia' }
  ];

  const courses = [
    { value: 'ciencia-computacao', label: 'Ciência da Computação' },
    { value: 'engenharia-software', label: 'Engenharia de Software' },
    { value: 'sistemas-informacao', label: 'Sistemas de Informação' },
    { value: 'matematica', label: 'Matemática' },
    { value: 'fisica', label: 'Física' },
    { value: 'engenharia-civil', label: 'Engenharia Civil' },
    { value: 'engenharia-eletrica', label: 'Engenharia Elétrica' },
    { value: 'engenharia-mecanica', label: 'Engenharia Mecânica' }
  ];

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
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>
            
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
