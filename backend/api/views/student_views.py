from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from api.serializers import StudentUpdateSerializer

# --- SCHEMAS ---
student_update_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'nome': openapi.Schema(type=openapi.TYPE_STRING),
        'email': openapi.Schema(type=openapi.TYPE_STRING),
        'senha': openapi.Schema(type=openapi.TYPE_STRING),
        'curso': openapi.Schema(type=openapi.TYPE_STRING),
    }
)

# --- VIEWS DE ALUNO ---

@api_view(['PUT'])
def update_student(request, matricula):
    data = request.data
    
    # Campos recebidos
    nome = data.get('nome')
    email = data.get('email')
    curso = data.get('curso')
    senha = data.get('senha') # Pode vir vazio ou None

    if not all([nome, email, curso]):
        return Response({"error": "Nome, email e curso são obrigatórios"}, 400)

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Pegar o CPF do aluno pela matrícula
                cursor.execute("SELECT fk_cpf FROM ALUNO WHERE matricula_aluno = %s", [matricula])
                row = cursor.fetchone()
                if not row:
                    return Response({"error": "Aluno não encontrado"}, 404)
                
                cpf = row[0]

                # 2. Atualizar tabela PESSOA (Nome, Email e Senha Opcional)
                if senha and senha.strip() != "":
                    # Se mandou senha, atualiza tudo
                    cursor.execute("""
                        UPDATE PESSOA 
                        SET nome = %s, email = %s, senha = %s 
                        WHERE cpf = %s
                    """, [nome, email, senha, cpf])
                else:
                    # Se NÃO mandou senha, atualiza só nome e email (mantém a senha antiga)
                    cursor.execute("""
                        UPDATE PESSOA 
                        SET nome = %s, email = %s 
                        WHERE cpf = %s
                    """, [nome, email, cpf])

                # 3. Atualizar tabela ALUNO (Curso)
                cursor.execute("""
                    UPDATE ALUNO SET curso = %s WHERE matricula_aluno = %s
                """, [curso, matricula])

        return Response({"message": "Dados do aluno atualizados com sucesso!"}, 200)

    except Exception as e:
        return Response({"error": str(e)}, 500)

@swagger_auto_schema(method='delete')
@api_view(['DELETE'])
def delete_student(request, matricula):
    """
    Deleta conta do aluno (Cascade manual).
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fk_cpf FROM ALUNO WHERE matricula_aluno = %s", [matricula])
            row = cursor.fetchone()
            if not row: return Response({"error": "Aluno não encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
            cpf_aluno = row[0]

            # Cascade Delete Manual
            cursor.execute("DELETE FROM AVALIACAO WHERE fk_matricula_aluno = %s", [matricula])
            cursor.execute("DELETE FROM MATRICULA WHERE fk_matricula_aluno = %s", [matricula])
            cursor.execute("DELETE FROM ALUNO WHERE matricula_aluno = %s", [matricula])

            # Verifica se é professor antes de apagar Pessoa
            cursor.execute("SELECT matricula_professor FROM PROFESSOR WHERE fk_cpf = %s", [cpf_aluno])
            
            if not cursor.fetchone():
                cursor.execute("DELETE FROM REGISTRO_USO WHERE fk_cpf = %s", [cpf_aluno])
                cursor.execute("DELETE FROM PESSOA WHERE cpf = %s", [cpf_aluno])

        return Response({"message": "Aluno excluído."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)