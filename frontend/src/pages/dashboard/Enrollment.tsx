import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Discipline {
  cod_disciplina: number;
  nome_disciplina: string;
  creditos: number;
  nome_departamento: string;
  capacidade: number;
  ocupadas: number;
}

const Enrollment = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Agora pega direto do LocalStorage
  const storedUser = localStorage.getItem("user_data"); // ⚠️ mudou de "user" para "user_data"
  const user = storedUser ? JSON.parse(storedUser) : null;
  const matriculaAluno = user?.matricula; // ✅ aqui você pega a matrícula  

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/disciplines/all/');
        const data = await res.json();
        setDisciplines(data);
      } catch (err) {
        console.error('Erro API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisciplines();
  }, []);

  const filtered = disciplines.filter((d) => {
    if (!searchTerm) return true;
    const term = caseInsensitive ? searchTerm.toLowerCase() : searchTerm;
    const name = caseInsensitive ? d.nome_disciplina.toLowerCase() : d.nome_disciplina;
    return name.includes(term);
  });

  // 📌 Função que faz matrícula + remove disciplina da tela
  const handleEnroll = async (disc: Discipline) => {
    if (!matriculaAluno) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar a matrícula do aluno.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/classes/enroll/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricula_aluno: matriculaAluno,
          cod_disciplina: disc.cod_disciplina
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erro ao matricular",
          description: data.error || "Tente novamente mais tarde",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Matrícula realizada!",
        description: `Você se matriculou em ${disc.nome_disciplina}`,
      });

      // ❗ Remove a disciplina da lista
      setDisciplines(prev =>
        prev.filter(d => d.cod_disciplina !== disc.cod_disciplina)
      );

    } catch (error) {
      console.error(error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível realizar a matrícula.",
        variant: "destructive",
      });
    }
  };

  const getColor = (ocupadas: number, capacidade: number) => {
    const percent = (ocupadas / capacidade) * 100;
    if (percent >= 90) return "text-red-600";
    if (percent >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Matrícula Online</h1>
        <p className="text-muted-foreground mt-1">Escolha sua disciplina</p>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar disciplina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="case-insensitive"
                checked={caseInsensitive}
                onCheckedChange={(v) => setCaseInsensitive(v as boolean)}
              />
              <Label htmlFor="case-insensitive">Ignorar maiúsculas/minúsculas</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && <p className="text-center py-10 text-muted-foreground">Carregando disciplinas...</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((disc) => {
          const vagas = disc.capacidade - disc.ocupadas;

          return (
            <Card key={disc.cod_disciplina} className="shadow-card hover:shadow-hover transition-all">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {disc.nome_disciplina}
                </CardTitle>
                <CardDescription className="text-sm">
                  {disc.nome_departamento}
                </CardDescription>
                <Badge variant="outline">{disc.creditos} créditos</Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className={getColor(disc.ocupadas, disc.capacidade)}>
                    {disc.ocupadas} / {disc.capacidade} vagas (restam {vagas})
                  </span>
                </div>

                <div className="w-full bg-muted h-2 rounded-full">
                  <div
                    className="bg-gradient-primary h-2 rounded-full"
                    style={{
                      width: `${(disc.ocupadas / disc.capacidade) * 100}%`,
                    }}
                  ></div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleEnroll(disc)}
                  disabled={disc.ocupadas >= disc.capacidade}
                >
                  {disc.ocupadas >= disc.capacidade ? "Turma cheia" : "Matricular"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Enrollment;
