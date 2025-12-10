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
    birthDate: '',
    course: '',
    department: ''
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

  // Lista de departamentos com IDs correspondentes à tabela DEPARTAMENTO
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

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.substring(0, 11);
    return limited
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setRegisterData({ ...registerData, cpf: formatted });
  };

  const extractErrorMessage = (errorStr: string) => {
    try {
        const parsed = JSON.parse(errorStr);
        return parsed.detail || parsed.message || "Erro desconhecido";
    } catch {
        return "Erro na solicitação";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginData.email, loginData.password);
    if (success) {
      toast({ title: "Login realizado!", description: "Indo para matrícula..." });
      window.location.href = "/dashboard/enrollment";
    } else {
      toast({ title: "Erro", description: "Login falhou", variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.name || !registerData.cpf || !registerData.birthDate) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    if (registerType === 'student' && !registerData.course) {
      toast({ title: "Erro", description: "Selecione um curso", variant: "destructive" });
      return;
    }

    if (registerType === 'professor' && !registerData.department) {
      toast({ title: "Erro", description: "Selecione um departamento", variant: "destructive" });
      return;
    }

    const cleanCPF = registerData.cpf.replace(/\D/g, '');

    const userData = registerType === 'student' ? {
      nome: registerData.name,
      cpf: cleanCPF,
      email: registerData.email,
      senha: registerData.password,
      data_nascimento: registerData.birthDate,
      curso: registerData.course
    } : {
      nome: registerData.name,
      cpf: cleanCPF,
      email: registerData.email,
      senha: registerData.password,
      data_nascimento: registerData.birthDate,
      departamento: Number(registerData.department) // aqui passamos o int
    };

    console.log("Enviando via useAuth:", userData);

    try {
      const success = await register(userData, registerType);
      if (success) {
        toast({
          title: "Cadastro realizado!",
          description: "Faça login para continuar.",
        });
        setRegisterData({ name: '', cpf: '', email: '', password: '', birthDate: '', course: '', department: '' });
        const loginTabBtn = document.querySelector('[data-value="login"]') as HTMLElement;
        if (loginTabBtn) loginTabBtn.click();
      }
    } catch (error: any) {
      const msg = extractErrorMessage(error.message);
      toast({ title: "Erro ao cadastrar", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">SIGA</CardTitle>
          <CardDescription>Sistema Integrado de Gestão Acadêmica</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
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
                <Button type="submit" className="w-full text-lg h-11">
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="register-cpf">CPF</Label>
                        <Input
                          id="register-cpf"
                          placeholder="000.000.000-00"
                          value={registerData.cpf}
                          onChange={handleCPFChange} 
                          required
                          maxLength={14} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="register-birth">Data Nasc.</Label>
                        <Input
                          id="register-birth"
                          type="date"
                          value={registerData.birthDate}
                          onChange={(e) => setRegisterData({ ...registerData, birthDate: e.target.value })}
                          required
                        />
                    </div>
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

                  {registerType === 'student' && (
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
                  )}

                  {registerType === 'professor' && (
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Select
                        value={registerData.department}
                        onValueChange={(value) => setRegisterData({ ...registerData, department: value })}
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Selecione o departamento..." />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dep => (
                            <SelectItem key={dep.value} value={dep.value.toString()}>
                              {dep.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-2">
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
