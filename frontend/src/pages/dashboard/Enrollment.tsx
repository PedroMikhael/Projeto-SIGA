import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClassData {
  cod_turma: number;
  capacidade: number;
  inscritos: number;
  vagas_restantes: number;
  disciplina: {
    cod_disciplina: number;
    nome_disciplina: string;
    creditos: number;
  };
}

interface DisciplineData {
  cod_disciplina: number;
  nome_disciplina: string;
  creditos: number;
  fk_cod_departamento: number;
}

const Enrollment = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [allDisciplines, setAllDisciplines] = useState<DisciplineData[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  // 🔵 1) BUSCA TODAS AS DISCIPLINAS
  const fetchAllDisciplines = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/disciplines/all/", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setAllDisciplines(data);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔵 2) BUSCA TURMAS DISPONÍVEIS
  const fetchClasses = async (query: string) => {
    if (!query.trim()) {
      setClasses([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/classes/available/?search=${query}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const safe = Array.isArray(data) ? data : [];
        setClasses(safe);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔵 3) Carregar disciplinas ao abrir
  useEffect(() => {
    fetchAllDisciplines();
  }, []);

  // 🔵 4) Buscar turmas quando digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleEnroll = async (cls: ClassData) => {
    setEnrollingId(cls.cod_turma);

    const storedUser = localStorage.getItem('user_data');
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const studentId = userData?.id || 1;

    const payload = {
      matricula_aluno: studentId,
      cod_turma: cls.cod_turma,
      cod_disciplina: cls.disciplina.cod_disciplina
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/classes/enroll/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Matrícula realizada!",
          description: `Você foi matriculado em ${cls.disciplina.nome_disciplina}`
        });

        fetchClasses(searchTerm);
      }
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Matrícula Online</h1>
        <p className="text-muted-foreground mt-1">
          Busque e inscreva-se nas disciplinas.
        </p>
      </div>

      {/* 🔍 Campo de busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por disciplina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 📚 Lista */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <Card key={cls.cod_turma}>
            <CardHeader>
              <CardTitle className="text-lg">
                {cls.disciplina.nome_disciplina}
              </CardTitle>
              <CardDescription>
                Departamento {cls.disciplina.cod_disciplina}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Créditos: {cls.disciplina.creditos}
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {cls.inscritos} / {cls.capacidade}
                </div>
              </div>

              <Button
                className="w-full"
                disabled={enrollingId === cls.cod_turma}
                onClick={() => handleEnroll(cls)}
              >
                {enrollingId === cls.cod_turma ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : "Inscrever-se"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && classes.length === 0 && searchTerm.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma turma encontrada.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Enrollment;
