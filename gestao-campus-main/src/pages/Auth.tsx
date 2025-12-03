import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerType, setRegisterType] = useState<'student' | 'professor'>('student');
  const [registerData, setRegisterData] = useState({
    name: '',
    cpf: '',
    email: '',
    password: '',
    course: '',
    department: ''
  });

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginData.email, loginData.password);
    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao SIGA",
      });
      navigate('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = registerType === 'student' 
      ? { ...registerData, type: 'student' as const, course: registerData.course }
      : { ...registerData, type: 'professor' as const, department: registerData.department };
    
    const success = await register(userData);
    if (success) {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-hover">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">SIGA</CardTitle>
          <CardDescription>Sistema Integrado de Gestão Acadêmica</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={registerType === 'student' ? 'default' : 'outline'}
                    onClick={() => setRegisterType('student')}
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Aluno
                  </Button>
                  <Button
                    type="button"
                    variant={registerType === 'professor' ? 'default' : 'outline'}
                    onClick={() => setRegisterType('professor')}
                    className="w-full"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Professor
                  </Button>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome Completo</Label>
                    <Input
                      id="register-name"
                      placeholder="João Silva"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-cpf">CPF</Label>
                    <Input
                      id="register-cpf"
                      placeholder="000.000.000-00"
                      value={registerData.cpf}
                      onChange={(e) => setRegisterData({ ...registerData, cpf: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>

                  {registerType === 'student' ? (
                    <div className="space-y-2">
                      <Label htmlFor="course">Curso</Label>
                      <Select
                        value={registerData.course}
                        onValueChange={(value) => setRegisterData({ ...registerData, course: value })}
                      >
                        <SelectTrigger id="course">
                          <SelectValue placeholder="Selecione o curso..." />
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
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Select
                        value={registerData.department}
                        onValueChange={(value) => setRegisterData({ ...registerData, department: value })}
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="computacao">Computação</SelectItem>
                          <SelectItem value="matematica">Matemática</SelectItem>
                          <SelectItem value="fisica">Física</SelectItem>
                          <SelectItem value="quimica">Química</SelectItem>
                          <SelectItem value="engenharia">Engenharia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    Cadastrar
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
