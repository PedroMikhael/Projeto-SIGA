from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection, transaction

@api_view(['GET'])
def listar_alunos_diario(request, cod_turma, cod_disciplina):
    try:
        with connection.cursor() as cursor:
            # JOIN PODEROSO:
            # 1. Pega Aluno e Pessoa (Nome)
            # 2. Pega Frequencia da Matricula
            # 3. Faz LEFT JOIN na Avaliação filtrando por 'N1'
            # 4. Faz LEFT JOIN na Avaliação filtrando por 'N2'
            sql = """
                SELECT 
                    a.matricula_aluno,
                    p.nome,
                    m.frequencia,
                    av1.nota as nota1,
                    av2.nota as nota2
                FROM MATRICULA m
                JOIN ALUNO a ON m.fk_matricula_aluno = a.matricula_aluno
                JOIN PESSOA p ON a.fk_cpf = p.cpf
                LEFT JOIN AVALIACAO av1 ON 
                    m.fk_matricula_aluno = av1.fk_matricula_aluno AND 
                    m.fk_cod_disciplina = av1.fk_cod_disciplina AND 
                    m.fk_cod_turma = av1.fk_cod_turma AND 
                    av1.id_avaliacao = 'N1'
                LEFT JOIN AVALIACAO av2 ON 
                    m.fk_matricula_aluno = av2.fk_matricula_aluno AND 
                    m.fk_cod_disciplina = av2.fk_cod_disciplina AND 
                    m.fk_cod_turma = av2.fk_cod_turma AND 
                    av2.id_avaliacao = 'N2'
                WHERE m.fk_cod_turma = %s AND m.fk_cod_disciplina = %s
                ORDER BY p.nome ASC
            """
            cursor.execute(sql, [cod_turma, cod_disciplina])
            rows = cursor.fetchall()

        alunos = []
        for row in rows:
            matr, nome, freq, n1, n2 = row
            alunos.append({
                "id": matr, # Usaremos a matricula como ID no front
                "name": nome,
                "attendance": freq if freq is not None else 100,
                "grade1": n1 if n1 is not None else "", # Vazio se não tiver nota
                "grade2": n2 if n2 is not None else ""
            })

        return Response(alunos, 200)
    except Exception as e:
        return Response({"error": str(e)}, 500)

@api_view(['POST'])
def salvar_notas_diario(request, cod_turma, cod_disciplina):
    # O front vai mandar uma lista de alunos com as notas editadas
    lista_alunos = request.data # Expect: [{id, attendance, grade1, grade2}, ...]

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                for aluno in lista_alunos:
                    matricula_aluno = aluno['id']
                    freq = aluno['attendance']
                    
                    # Convertendo vazio para None ou 0
                    n1 = aluno['grade1'] if aluno['grade1'] != "" else None
                    n2 = aluno['grade2'] if aluno['grade2'] != "" else None

                    # 1. ATUALIZAR FREQUÊNCIA (Tabela MATRICULA)
                    cursor.execute("""
                        UPDATE MATRICULA SET frequencia = %s 
                        WHERE fk_matricula_aluno = %s AND fk_cod_turma = %s AND fk_cod_disciplina = %s
                    """, [freq, matricula_aluno, cod_turma, cod_disciplina])

                    # 2. ATUALIZAR/INSERIR NOTA 1 (Tabela AVALIACAO)
                    # Helper interno para UPSERT (Update ou Insert)
                    def upsert_nota(id_av, valor):
                        if valor is None: return # Se vazio, não faz nada (ou poderia deletar)
                        
                        # Tenta atualizar
                        cursor.execute("""
                            UPDATE AVALIACAO SET nota = %s
                            WHERE id_avaliacao = %s AND fk_matricula_aluno = %s 
                              AND fk_cod_turma = %s AND fk_cod_disciplina = %s
                        """, [valor, id_av, matricula_aluno, cod_turma, cod_disciplina])
                        
                        # Se não atualizou nada (rowcount=0), insere
                        if cursor.rowcount == 0:
                            cursor.execute("""
                                INSERT INTO AVALIACAO (id_avaliacao, fk_matricula_aluno, fk_cod_disciplina, fk_cod_turma, nota)
                                VALUES (%s, %s, %s, %s, %s)
                            """, [id_av, matricula_aluno, cod_disciplina, cod_turma, valor])

                    upsert_nota('N1', n1)
                    upsert_nota('N2', n2)

        return Response({"message": "Diário salvo com sucesso!"}, 200)
    except Exception as e:
        return Response({"error": str(e)}, 500)