"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Ajuste o import do seu contexto
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface Student {
  id: number; // matricula
  name: string;
  grade1: string | number; // Pode ser string vazia enquanto digita
  grade2: string | number;
  attendance: number;
}

interface ClassOption {
    cod_turma: string;
    cod_disciplina: number;
    nome_disciplina: string;
}

const ClassBook = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estado para armazenar qual turma+disciplina está selecionada
  // Armazena string JSON: '{"t":"T01","d":105}'
  const [selectedClassJson, setSelectedClassJson] = useState<string>('');
  
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Carregar as Turmas do Professor ao abrir a página
  useEffect(() => {
    if (!user?.matricula) return;
    
    const fetchClasses = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/professores/${user.matricula}/disciplinas/`);
            if(res.ok) {
                const data = await res.json();
                // O backend retorna uma estrutura aninhada, vamos simplificar para o select
                const mapped = data.map((item: any) => ({
                    cod_turma: item.cod_turma,
                    cod_disciplina: item.disciplina.cod_disciplina,
                    nome_disciplina: item.disciplina.nome_disciplina
                }));
                setClasses(mapped);
            }
        } catch (error) {
            console.error("Erro ao buscar turmas", error);
        }
    };
    fetchClasses();
  }, [user]);

  // 2. Quando seleciona uma turma, busca os alunos
  useEffect(() => {
    if (!selectedClassJson) return;

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { t, d } = JSON.parse(selectedClassJson);
            // Chama a nova rota de listar alunos do diário
            const res = await fetch(`http://127.0.0.1:8000/api/turma/${t}/${d}/alunos/`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            } else {
                toast({ title: "Erro", description: "Não foi possível carregar os alunos.", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    fetchStudents();
  }, [selectedClassJson]);

  // Manipuladores de Input
  const handleGradeChange = (studentId: number, field: 'grade1' | 'grade2', value: string) => {
    // Permite digitar, mas valida se é número
    if (value !== "" && (parseFloat(value) < 0 || parseFloat(value) > 10)) return;
    
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, [field]: value } : s
    ));
  };

  const handleAttendanceChange = (studentId: number, value: string) => {
    const num = parseFloat(value);
    if (num < 0 || num > 100) return;

    setStudents(students.map(s => 
      s.id === studentId ? { ...s, attendance: value === "" ? 0 : num } : s
    ));
  };

  // 3. Salvar no Banco
  const handleSaveGrades = async () => {
    if (!selectedClassJson) return;
    setSaving(true);
    
    try {
        const { t, d } = JSON.parse(selectedClassJson);
        const res = await fetch(`http://127.0.0.1:8000/api/turma/${t}/${d}/salvar/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(students)
        });

        if (res.ok) {
            toast({
              title: 'Notas salvas com sucesso!',
              description: 'As alterações foram registradas no sistema.',
              className: "bg-green-600 text-white"
            });
        } else {
            throw new Error();
        }
    } catch (error) {
        toast({ title: 'Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
        setSaving(false);
    }
  };

  // Helpers de Visualização
  const calculateAverage = (student: Student) => {
    const g1 = student.grade1 === "" ? 0 : Number(student.grade1);
    const g2 = student.grade2 === "" ? 0 : Number(student.grade2);
    // Se quiser considerar que se falta uma nota a média não existe, adicione lógica aqui
    return ((g1 + g2) / 2).toFixed(1);
  };

  const getStatus = (student: Student) => {
    const avg = parseFloat(calculateAverage(student));
    if (avg >= 7 && student.attendance >= 75) return { text: 'Aprovado', color: 'text-green-600 font-bold' };
    if (student.attendance < 75) return { text: 'Reprovado por Falta', color: 'text-red-600 font-bold' };
    return { text: 'Reprovado por Nota', color: 'text-red-600 font-bold' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Diário de Classe</h1>
        <p className="text-muted-foreground mt-1">Gerencie notas e frequência dos alunos</p>
      </div>

      {/* SELETOR DE TURMA */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Selecionar Turma</CardTitle>
          <CardDescription>Escolha a disciplina para lançar as notas</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClassJson} onValueChange={setSelectedClassJson}>
            <SelectTrigger className="max-w-md bg-white">
              <SelectValue placeholder="Selecione uma turma..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem 
                    key={`${cls.cod_turma}-${cls.cod_disciplina}`} 
                    // Truque: Passamos um JSON no value para recuperar os dois IDs depois
                    value={JSON.stringify({ t: cls.cod_turma, d: cls.cod_disciplina })}
                >
                  {cls.nome_disciplina} (Turma {cls.cod_turma})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* TABELA DE ALUNOS */}
      {selectedClassJson && (
          <Card className="shadow-sm border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Alunos Matriculados</CardTitle>
                  <CardDescription>Lance as notas (0-10) e frequência (0-100%)</CardDescription>
              </div>
              <Button onClick={handleSaveGrades} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Diário
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
              ) : students.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">Nenhum aluno matriculado nesta turma.</div>
              ) : (
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="w-[300px]">Aluno</TableHead>
                          <TableHead className="text-center">Nota 1 (N1)</TableHead>
                          <TableHead className="text-center">Nota 2 (N2)</TableHead>
                          <TableHead className="text-center">Média</TableHead>
                          <TableHead className="text-center">Frequência (%)</TableHead>
                          <TableHead className="text-center">Situação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => {
                          const status = getStatus(student);
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                  <div>{student.name}</div>
                                  <div className="text-xs text-muted-foreground">Mat: {student.id}</div>
                              </TableCell>
                              <TableCell className="text-center p-2">
                                <Input
                                  type="number"
                                  placeholder="-"
                                  value={student.grade1}
                                  onChange={(e) => handleGradeChange(student.id, 'grade1', e.target.value)}
                                  className="w-20 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-center p-2">
                                <Input
                                  type="number"
                                  placeholder="-"
                                  value={student.grade2}
                                  onChange={(e) => handleGradeChange(student.id, 'grade2', e.target.value)}
                                  className="w-20 text-center mx-auto"
                                />
                              </TableCell>
                              <TableCell className="text-center font-bold text-slate-700 bg-slate-50">
                                {calculateAverage(student)}
                              </TableCell>
                              <TableCell className="text-center p-2">
                                <div className="flex items-center justify-center gap-1">
                                    <Input
                                    type="number"
                                    value={student.attendance}
                                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                    className="w-20 text-center"
                                    />
                                    <span className="text-xs text-muted-foreground">%</span>
                                </div>
                              </TableCell>
                              <TableCell className={`text-center text-sm ${status.color}`}>
                                {status.text}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
              )}
            </CardContent>
          </Card>
      )}
    </div>
  );
};

export default ClassBook;