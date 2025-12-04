import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  grade1: number;
  grade2: number;
  attendance: number;
}

const ClassBook = () => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState('1');
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Maria Santos', grade1: 8.5, grade2: 9.0, attendance: 95 },
    { id: '2', name: 'Pedro Oliveira', grade1: 7.0, grade2: 8.5, attendance: 88 },
    { id: '3', name: 'Ana Costa', grade1: 9.5, grade2: 9.5, attendance: 100 },
  ]);

  const classes = [
    { id: '1', name: 'Algoritmos e Programação I' },
    { id: '2', name: 'Banco de Dados' },
  ];

  const handleGradeChange = (studentId: string, field: 'grade1' | 'grade2', value: string) => {
    const numValue = parseFloat(value) || 0;
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, [field]: numValue } : s
    ));
  };

  const handleAttendanceChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, attendance: Math.min(100, Math.max(0, numValue)) } : s
    ));
  };

  const handleSaveGrades = () => {
    toast({
      title: 'Notas salvas com sucesso!',
      description: 'As alterações foram registradas no sistema.',
    });
  };

  const calculateAverage = (student: Student) => {
    return ((student.grade1 + student.grade2) / 2).toFixed(1);
  };

  const getStatus = (student: Student) => {
    const avg = parseFloat(calculateAverage(student));
    if (avg >= 7 && student.attendance >= 75) return { text: 'Aprovado', color: 'text-green-600' };
    if (student.attendance < 75) return { text: 'Reprovado por Falta', color: 'text-red-600' };
    return { text: 'Reprovado', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Diário de Classe</h1>
        <p className="text-muted-foreground mt-1">Gerencie notas e frequência dos alunos</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Selecionar Turma</CardTitle>
          <CardDescription>Escolha a turma para lançar as notas</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Alunos Matriculados</CardTitle>
          <CardDescription>Lance as notas e frequência dos alunos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="text-center">Nota 1</TableHead>
                  <TableHead className="text-center">Nota 2</TableHead>
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
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={student.grade1}
                          onChange={(e) => handleGradeChange(student.id, 'grade1', e.target.value)}
                          className="w-20 text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={student.grade2}
                          onChange={(e) => handleGradeChange(student.id, 'grade2', e.target.value)}
                          className="w-20 text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {calculateAverage(student)}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={student.attendance}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          className="w-20 text-center"
                        />
                      </TableCell>
                      <TableCell className={`text-center font-medium ${status.color}`}>
                        {status.text}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveGrades} size="lg">
              Salvar Notas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassBook;
