"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, TrendingUp } from "lucide-react";

interface Discipline {
  subject: string;
  professor: string;
  grade1: number;
  grade2: number;
  average: number;
  attendance: number;
  status: string;
  horario?: string; // ex: "Seg/Qua 10:00"
  credits?: number;
}

interface History {
  semester: string;
  subject: string;
  finalGrade: number;
  status: string;
  credits: number;
}

interface UserData {
  matricula: string;
  name: string;
  course: string;
  type: string;
}

// --- Auxiliares para horários ---
const dayMap: Record<string, number> = {
  "Dom": 0, "Seg": 1, "Ter": 2, "Qua": 3, "Qui": 4, "Sex": 5, "Sáb": 6
};

function parseSchedule(schedule: string) {
  if (!schedule) return [];
  const [daysPart, timePart] = schedule.split(" ");
  const days = daysPart.split("/");
  const [hourStr, minuteStr] = timePart.split(":");
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  return days.map((d) => ({
    day: dayMap[d],
    hour,
    minute
  }));
}

function getNextClassTime(schedule: string) {
  const now = new Date();
  const parsed = parseSchedule(schedule);
  const futureDates = parsed.map((s) => {
    const date = new Date();
    const diffDays = (s.day + 7 - date.getDay()) % 7;
    date.setDate(date.getDate() + diffDays);
    date.setHours(s.hour, s.minute, 0, 0);
    return date;
  });
  const upcoming = futureDates.filter((d) => d > now);
  if (upcoming.length === 0) return null;
  return new Date(Math.min(...upcoming.map((d) => d.getTime())));
}

function formatNextClass(date: Date) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayName = days[date.getDay()];
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  return `${dayName} às ${hour}:${minute}`;
}

const DashboardHome = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [grades, setGrades] = useState<Discipline[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (!storedUser) return;

    const parsedUser: UserData = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.type !== "student") {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1️⃣ Boletim
        const gradesRes = await fetch(`http://127.0.0.1:8000/api/students/${parsedUser.matricula}/grades/`);
        const gradesData: Discipline[] = await gradesRes.json();

        // 2️⃣ Histórico
        const historyRes = await fetch(`http://127.0.0.1:8000/api/students/${parsedUser.matricula}/history/`);
        const historyData: History[] = await historyRes.json();

        // 3️⃣ Horários representativos
        const disciplinesRes = await fetch(`http://127.0.0.1:8000/api/disciplines/all/`);
        const allDisciplines: any[] = await disciplinesRes.json();

        const gradesWithSchedule = gradesData.map((g) => {
          const d = allDisciplines.find((d) => d.nome_disciplina === g.subject);
          return { ...g, horario: d?.horario };
        });

        setGrades(gradesWithSchedule);
        setHistory(historyData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) return <p>Carregando usuário...</p>;
  if (user.type !== "student") return <p>Dashboard apenas para alunos.</p>;
  if (loading) return <p>Carregando dados...</p>;

  // Estatísticas
  const disciplinasCursando = grades.length;
  const mediaGeral = grades.reduce((acc, g) => acc + g.average, 0) / (grades.length || 1);
  const frequenciaMedia = grades.reduce((acc, g) => acc + g.attendance, 0) / (grades.length || 1);
  const creditosConcluidos = history.reduce((acc, h) => acc + h.credits, 0);

  const stats = [
    { title: "Disciplinas Cursando", value: disciplinasCursando, icon: BookOpen, color: "text-primary" },
    { title: "Média Geral", value: mediaGeral.toFixed(2), icon: TrendingUp, color: "text-accent" },
    { title: "Frequência Média", value: frequenciaMedia.toFixed(1) + "%", icon: Calendar, color: "text-secondary" },
    { title: "Créditos Concluídos", value: creditosConcluidos, icon: Users, color: "text-primary" },
  ];

  // Próximas aulas usando horários reais
  const nextClasses = grades
    .map((g) => {
      if (!g.horario) return null;
      const nextDate = getNextClassTime(g.horario);
      if (!nextDate) return null;
      return { subject: g.subject, professor: g.professor, time: formatNextClass(nextDate) };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a!.time).getTime() - new Date(b!.time).getTime())
    .slice(0, 3);

  // Notificações mockadas
  const notifications = [
    { title: "Período de matrícula aberto", description: "Até 15/12/2025", type: "primary" },
    { title: "Novo cardápio no RU", description: "Confira as novidades", type: "accent" },
    { title: "Atualização de notas", description: "Verifique seu boletim", type: "secondary" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {user.name}!</h1>
        <p className="text-muted-foreground mt-1">Curso: {user.course}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-hover transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Próximas Aulas</CardTitle>
            <CardDescription>Suas próximas atividades acadêmicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextClasses.length === 0 && <p className="text-muted-foreground">Nenhuma aula futura encontrada</p>}
              {nextClasses.map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{c!.subject}</p>
                    <p className="text-sm text-muted-foreground">{c!.professor} - {c!.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Avisos Importantes</CardTitle>
            <CardDescription>Últimas notificações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border-l-4 ${
                    n.type === "primary" ? "border-primary" :
                    n.type === "accent" ? "border-accent" : "border-secondary"
                  } bg-muted/50`}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
