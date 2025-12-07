from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from drf_yasg.utils import swagger_auto_schema
from api.serializers import ProfessorUpdateSerializer
from drf_yasg import openapi
import random
from django.db import transaction


@api_view(['PUT'])
def update_professor(request, matricula):
    data = request.data
    
    # Campos recebidos
    nome = data.get('nome')
    email = data.get('email')
    dept_id = data.get('fk_cod_departamento') # Frontend manda o ID do departamento
    senha = data.get('senha')

    if not all([nome, email, dept_id]):
        return Response({"error": "Nome, email e departamento são obrigatórios"}, 400)

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Pegar o CPF do professor
                cursor.execute("SELECT fk_cpf FROM PROFESSOR WHERE matricula_professor = %s", [matricula])
                row = cursor.fetchone()
                if not row:
                    return Response({"error": "Professor não encontrado"}, 404)
                
                cpf = row[0]

                # 2. Atualizar tabela PESSOA (Lógica condicional de senha)
                if senha and senha.strip() != "":
                    cursor.execute("""
                        UPDATE PESSOA 
                        SET nome = %s, email = %s, senha = %s 
                        WHERE cpf = %s
                    """, [nome, email, senha, cpf])
                else:
                    cursor.execute("""
                        UPDATE PESSOA 
                        SET nome = %s, email = %s 
                        WHERE cpf = %s
                    """, [nome, email, cpf])

                # 3. Atualizar tabela PROFESSOR (Departamento)
                cursor.execute("""
                    UPDATE PROFESSOR 
                    SET fk_cod_departamento = %s 
                    WHERE matricula_professor = %s
                """, [dept_id, matricula])

        return Response({"message": "Dados do professor atualizados com sucesso!"}, 200)

    except Exception as e:
        return Response({"error": str(e)}, 500)
    

@api_view(['GET'])
def listar_disciplinas_professor(request, matricula):
    search = request.query_params.get("search", "")
    pattern = f"%{search}%"

    try:
        with connection.cursor() as cursor:
            # Trazemos também t.horario e t.semestre
            sql = """
                SELECT 
                    d.cod_disciplina, d.nome_disciplina, d.creditos,
                    t.cod_turma, COALESCE(t.capacidade, 0), t.horario, t.semestre,
                    (SELECT COUNT(*) FROM matricula m WHERE m.fk_cod_turma = t.cod_turma AND m.fk_cod_disciplina = d.cod_disciplina) as inscritos
                FROM DISCIPLINA d
                LEFT JOIN TURMA t ON d.cod_disciplina = t.fk_cod_disciplina
                WHERE d.fk_matricula_professor = %s 
                  AND LOWER(d.nome_disciplina) LIKE LOWER(%s)
                ORDER BY d.nome_disciplina ASC
            """
            cursor.execute(sql, [matricula, pattern])
            rows = cursor.fetchall()

        results = []
        for row in rows:
            # Desempacotar as novas colunas
            cod_disc, nome_disc, creditos, cod_turma, capacidade, horario, semestre, inscritos = row
            
            inscritos = inscritos if inscritos else 0
            
            # Se não tiver turma, cria ID virtual só pro front não quebrar
            turma_id = cod_turma if cod_turma else f"virtual-{cod_disc}"

            results.append({
                "cod_turma": turma_id,
                "capacidade": capacidade,
                "inscritos": inscritos,
                "vagas_restantes": capacidade - inscritos,
                "horario": horario,   # CAMPO NOVO
                "semester": semestre, # CAMPO NOVO DO BANCO
                "disciplina": {
                    "cod_disciplina": cod_disc,
                    "nome_disciplina": nome_disc,
                    "creditos": creditos,
                }
            })

        return Response(results, 200)
    except Exception as e:
        return Response({"error": str(e)}, 500)

    # Função auxiliar para gerar o código de horário UECE (ex: 35TCD)
def gerar_horario_uece(dias, turno, slot):
    # Dias: 24 (Seg/Qua), 35 (Ter/Qui), 6 (Sex)
    # Turno: M (Manhã), T (Tarde)
    # Slot: AB, CD, EF
    return f"{dias}{turno}{slot}"

@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'nome_disciplina': openapi.Schema(type=openapi.TYPE_STRING),
            'cod_departamento': openapi.Schema(type=openapi.TYPE_INTEGER),
            'semestre': openapi.Schema(type=openapi.TYPE_STRING, example="2025.1"),
            'dias': openapi.Schema(type=openapi.TYPE_STRING, enum=['24', '35', '6']),
            'turno': openapi.Schema(type=openapi.TYPE_STRING, enum=['M', 'T']),
            'slot': openapi.Schema(type=openapi.TYPE_STRING, enum=['AB', 'CD', 'EF']),
        }
    )
)
@api_view(['POST'])
def criar_disciplina_e_turma(request, matricula):
    data = request.data
    nome = data.get('nome_disciplina')
    depto = data.get('cod_departamento')
    semestre = data.get('semestre')
    
    # Monta horario
    dias = data.get('dias')
    turno = data.get('turno')
    slot = data.get('slot')
    horario = f"{dias}{turno}{slot}"

    if not all([nome, depto, semestre, dias, turno, slot]):
        return Response({"error": "Campos incompletos"}, 400)

    # Gera IDs
    import random
    novo_id_disc = random.randint(1000, 99999)
    # FIX: Cod turma agora é único ligado à disciplina (ex: T12345)
    novo_id_turma = f"T{novo_id_disc}" 

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO DISCIPLINA (cod_disciplina, nome_disciplina, creditos, fk_cod_departamento, fk_matricula_professor)
                    VALUES (%s, %s, 4, %s, %s)
                """, [novo_id_disc, nome, depto, matricula])

                cursor.execute("""
                    INSERT INTO TURMA (cod_turma, fk_cod_disciplina, semestre, horario, fk_matricula_prof, capacidade)
                    VALUES (%s, %s, %s, %s, %s, 30)
                """, [novo_id_turma, novo_id_disc, semestre, horario, matricula])

        return Response({"message": "Criado com sucesso"}, 201)
    except Exception as e:
        return Response({"error": str(e)}, 500)
    

@api_view(['DELETE'])
def deletar_disciplina_turma(request, matricula, cod_turma):
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Descobre qual é a disciplina dessa turma
                cursor.execute("SELECT fk_cod_disciplina FROM TURMA WHERE cod_turma = %s", [cod_turma])
                row = cursor.fetchone()
                
                if not row:
                    return Response({"error": "Turma não encontrada"}, 404)
                
                id_disc = row[0]

                # ====================================================
                # ORDEM DE EXCLUSÃO (CASCATA MANUAL)
                # ====================================================
                
                # 1º: Apagar AVALIAÇÕES (Notas lançadas nessa turma)
                # Sua tabela AVALIACAO tem fk_cod_turma, então podemos apagar direto por ela
                cursor.execute("DELETE FROM AVALIACAO WHERE fk_cod_turma = %s", [cod_turma])

                # 2º: Apagar MATRÍCULAS (Alunos inscritos nessa turma)
                cursor.execute("DELETE FROM MATRICULA WHERE fk_cod_turma = %s", [cod_turma])

                # 3º: Apagar a TURMA
                cursor.execute("DELETE FROM TURMA WHERE cod_turma = %s", [cod_turma])
                
                # 4º: Apagar a DISCIPLINA
                cursor.execute("DELETE FROM DISCIPLINA WHERE cod_disciplina = %s", [id_disc])

        return Response({"message": "Disciplina, Turma, Matrículas e Avaliações excluídas com sucesso."}, 200)

    except Exception as e:
        print(f"ERRO SQL: {str(e)}") # Isso ajuda a ver o erro no terminal
        return Response({"error": f"Erro ao excluir: {str(e)}"}, 500)
    

@api_view(['PUT'])
def editar_disciplina_turma(request, matricula, cod_turma):
    data = request.data
    # Recebe os dados do front
    novo_nome = data.get('nome_disciplina')
    nova_cap = data.get('capacidade')
    novo_semestre = data.get('semestre')
    
    # Horario
    dias = data.get('dias')
    turno = data.get('turno')
    slot = data.get('slot')
    novo_horario = f"{dias}{turno}{slot}"

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Atualiza Turma (Capacidade, Semestre, Horario)
                cursor.execute("""
                    UPDATE TURMA 
                    SET capacidade = %s, semestre = %s, horario = %s
                    WHERE cod_turma = %s AND fk_matricula_prof = %s
                """, [nova_cap, novo_semestre, novo_horario, cod_turma, matricula])
                
                # 2. Descobre o ID da disciplina dessa turma para mudar o nome
                cursor.execute("SELECT fk_cod_disciplina FROM TURMA WHERE cod_turma = %s", [cod_turma])
                row = cursor.fetchone()
                
                if row:
                    id_disc = row[0]
                    cursor.execute("""
                        UPDATE DISCIPLINA SET nome_disciplina = %s WHERE cod_disciplina = %s
                    """, [novo_nome, id_disc])

        return Response({"message": "Atualizado!"}, 200)
    except Exception as e:
        return Response({"error": str(e)}, 500)
    

@api_view(['DELETE'])
def delete_professor(request, matricula):
    """
    Deleta conta do professor.
    1. Apaga Turmas (e cascata para Matricula/Avaliacao).
    2. Desvincula Disciplinas.
    3. Verifica se é aluno; se não for, apaga Pessoa e Tickets do RU.
    """
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Pega CPF
                cursor.execute("SELECT fk_cpf FROM PROFESSOR WHERE matricula_professor = %s", [matricula])
                row = cursor.fetchone()
                if not row: 
                    return Response({"error": "Professor não encontrado"}, 404)
                
                cpf_prof = row[0]

                # 2. LIMPEZA DE TURMAS (Cascade Manual)
                # Primeiro pegamos as turmas desse professor
                cursor.execute("SELECT cod_turma FROM TURMA WHERE fk_matricula_prof = %s", [matricula])
                turmas = cursor.fetchall()
                
                for turma in turmas:
                    cod_t = turma[0]
                    # Apaga dependencias da turma
                    cursor.execute("DELETE FROM AVALIACAO WHERE fk_cod_turma = %s", [cod_t])
                    cursor.execute("DELETE FROM MATRICULA WHERE fk_cod_turma = %s", [cod_t])
                    cursor.execute("DELETE FROM TURMA WHERE cod_turma = %s", [cod_t])

                # 3. DESVINCULAR DISCIPLINAS (Não apaga a disciplina, só tira o dono)
                cursor.execute("UPDATE DISCIPLINA SET fk_matricula_professor = NULL WHERE fk_matricula_professor = %s", [matricula])

                # 4. APAGAR PROFESSOR
                cursor.execute("DELETE FROM PROFESSOR WHERE matricula_professor = %s", [matricula])

                # 5. VERIFICAR SE EXISTE COMO ALUNO
                cursor.execute("SELECT 1 FROM ALUNO WHERE fk_cpf = %s", [cpf_prof])
                is_student = cursor.fetchone()

                if not is_student:
                    # Se não for aluno, apaga os dados globais (RU e PESSOA)
                    cursor.execute("DELETE FROM REGISTRO_USO WHERE fk_cpf = %s", [cpf_prof])
                    cursor.execute("DELETE FROM PESSOA WHERE cpf = %s", [cpf_prof])

        return Response({"message": "Conta de professor excluída com sucesso."}, 200)

    except Exception as e:
        return Response({"error": str(e)}, 500)
    

@api_view(['GET'])
def get_professor_reports(request, matricula):
    try:
        with connection.cursor() as cursor:
            # Busca TODOS os alunos, disciplinas e notas desse professor
            sql = """
                SELECT 
                    D.nome_disciplina,
                    P.nome AS nome_aluno,
                    m.fk_matricula_aluno,
                    MAX(CASE WHEN AV.id_avaliacao = 'N1' THEN AV.nota ELSE NULL END) as n1,
                    MAX(CASE WHEN AV.id_avaliacao = 'N2' THEN AV.nota ELSE NULL END) as n2
                FROM TURMA T
                JOIN DISCIPLINA D ON T.fk_cod_disciplina = D.cod_disciplina
                JOIN MATRICULA M ON T.cod_turma = M.fk_cod_turma AND T.fk_cod_disciplina = M.fk_cod_disciplina
                JOIN ALUNO A ON M.fk_matricula_aluno = A.matricula_aluno
                JOIN PESSOA P ON A.fk_cpf = P.cpf
                LEFT JOIN AVALIACAO AV ON M.fk_matricula_aluno = AV.fk_matricula_aluno 
                                      AND M.fk_cod_disciplina = AV.fk_cod_disciplina
                                      AND M.fk_cod_turma = AV.fk_cod_turma
                WHERE T.fk_matricula_prof = %s
                GROUP BY D.nome_disciplina, P.nome, m.fk_matricula_aluno
            """
            cursor.execute(sql, [matricula])
            rows = cursor.fetchall()

        # Estruturas para processamento
        disciplines_data = {} # { 'NomeDisc': { total_grades: 0, count: 0, students: [] } }
        total_students_set = set()
        global_sum_grades = 0
        global_grade_count = 0
        approved_count = 0
        total_valid_students = 0 # Alunos que já tem nota para contar na taxa

        for row in rows:
            disc_name, student_name, student_id, n1, n2 = row
            total_students_set.add(student_id)

            # Inicializa disciplina se não existir
            if disc_name not in disciplines_data:
                disciplines_data[disc_name] = {
                    'name': disc_name,
                    'sum_grades': 0,
                    'count_grades': 0,
                    'students': [] # Lista de {name, average}
                }

            # Calcula média do aluno
            val_n1 = float(n1) if n1 is not None else 0.0
            val_n2 = float(n2) if n2 is not None else 0.0
            
            # Consideramos que o aluno "participa" da estatística se tiver pelo menos uma nota ou se o semestre acabou
            # Aqui vamos calcular a média simples
            average = (val_n1 + val_n2) / 2

            # Adiciona aos dados da disciplina
            disciplines_data[disc_name]['students'].append({
                'name': student_name,
                'average': average
            })
            disciplines_data[disc_name]['sum_grades'] += average
            disciplines_data[disc_name]['count_grades'] += 1

            # Dados Globais
            global_sum_grades += average
            global_grade_count += 1
            
            # Taxa de aprovação (Considerando média 7)
            if average >= 7.0:
                approved_count += 1
            total_valid_students += 1

        # --- PROCESSAMENTO FINAL ---
        
        # 1. KPIs
        total_students = len(total_students_set)
        global_average = (global_sum_grades / global_grade_count) if global_grade_count > 0 else 0
        approval_rate = (approved_count / total_valid_students * 100) if total_valid_students > 0 else 0
        active_disciplines = len(disciplines_data)

        # 2. Médias por Disciplina
        discipline_averages = []
        top_students_by_discipline = []

        for disc_name, data in disciplines_data.items():
            avg = (data['sum_grades'] / data['count_grades']) if data['count_grades'] > 0 else 0
            
            discipline_averages.append({
                "discipline": disc_name,
                "average": round(avg, 1),
                "students": data['count_grades']
            })

            # 3. Top 3 Alunos
            # Ordena alunos pela média descrescente
            sorted_students = sorted(data['students'], key=lambda x: x['average'], reverse=True)
            top_3 = sorted_students[:3]
            
            top_students_by_discipline.append({
                "discipline": disc_name,
                "students": top_3
            })

        response_data = {
            "kpis": {
                "total_students": total_students,
                "global_average": round(global_average, 1),
                "approval_rate": round(approval_rate),
                "active_disciplines": active_disciplines
            },
            "discipline_averages": discipline_averages,
            "top_students": top_students_by_discipline
        }

        return Response(response_data, 200)

    except Exception as e:
        return Response({"error": str(e)}, 500)