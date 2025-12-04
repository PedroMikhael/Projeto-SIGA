from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import random
from datetime import datetime
import uuid
from rest_framework_simplejwt.tokens import RefreshToken

# --- SCHEMAS DO SWAGGER ---
student_register_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'nome': openapi.Schema(type=openapi.TYPE_STRING),
        'cpf': openapi.Schema(type=openapi.TYPE_STRING),
        'email': openapi.Schema(type=openapi.TYPE_STRING),
        'senha': openapi.Schema(type=openapi.TYPE_STRING),
        'data_nascimento': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='YYYY-MM-DD'),
        'curso': openapi.Schema(type=openapi.TYPE_STRING),
    },
    required=['nome', 'cpf', 'email', 'senha', 'data_nascimento', 'curso']
)

professor_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'nome': openapi.Schema(type=openapi.TYPE_STRING),
        'cpf': openapi.Schema(type=openapi.TYPE_STRING),
        'email': openapi.Schema(type=openapi.TYPE_STRING),
        'senha': openapi.Schema(type=openapi.TYPE_STRING),
        'data_nascimento': openapi.Schema(type=openapi.FORMAT_DATE),
        'departamento': openapi.Schema(type=openapi.TYPE_STRING),
    },
    required=['nome', 'cpf', 'email', 'senha', 'data_nascimento', 'departamento']
)


login_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING),
        'senha': openapi.Schema(type=openapi.TYPE_STRING),
    },
    required=['email', 'senha']
)

# --- VIEWS DE AUTENTICAÇÃO ---

@swagger_auto_schema(method='post', request_body=student_register_schema)
@api_view(['POST'])
def register_student(request):
    """
    Cadastra um novo aluno usando SQL Nativo.
    """
    data = request.data
    year_prefix = datetime.now().year
    matricula = int(f"{year_prefix}{random.randint(100, 999)}")

    try:
        with connection.cursor() as cursor:
            sql_pessoa = "INSERT INTO PESSOA (cpf, nome, email, data_nascimento, senha) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql_pessoa, [data['cpf'], data['nome'], data['email'], data['data_nascimento'], data['senha']])

            sql_aluno = "INSERT INTO ALUNO (matricula_aluno, curso, fk_cpf) VALUES (%s, %s, %s)"
            cursor.execute(sql_aluno, [matricula, data['curso'], data['cpf']])

        return Response({"message": "Aluno cadastrado!", "matricula": matricula}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=login_schema)
@api_view(['POST'])
def login_user(request):
    """
    Realiza login verificando email e senha e retorna Token JWT Real.
    """
    email = request.data.get('email')
    senha = request.data.get('senha')

    with connection.cursor() as cursor:
        # Busca na tabela PESSOA
        sql = "SELECT cpf, nome, email FROM PESSOA WHERE email = %s AND senha = %s"
        cursor.execute(sql, [email, senha])
        pessoa = cursor.fetchone()

        if not pessoa:
            return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        
        cpf_encontrado = pessoa[0]
        nome_encontrado = pessoa[1]
        email_encontrado = pessoa[2]

        # Verifica se é Aluno
        cursor.execute("SELECT matricula_aluno, curso FROM ALUNO WHERE fk_cpf = %s", [cpf_encontrado])
        aluno = cursor.fetchone()
        
        if aluno:
            matricula = aluno[0]
            curso = aluno[1]
            tipo_usuario = "student"
            user_id = matricula
        else:
            # Verifica se é Professor
            cursor.execute("SELECT matricula_professor FROM PROFESSOR WHERE fk_cpf = %s", [cpf_encontrado])
            professor = cursor.fetchone()
            if professor:
                tipo_usuario = "professor"
                user_id = professor[0]
                curso = None
            else:
                # Admin ou Outro
                tipo_usuario = "admin"
                user_id = 0
                curso = None

        # --- GERAÇÃO DO TOKEN JWT REAL ---
        # Como estamos usando SQL nativo e não o User do Django, 
        # criamos um token manualmente e inserimos os dados nele (Payload)
        
        refresh = RefreshToken()
        
        # Inserimos dados personalizados dentro do token (Payload)
        # Isso permite recuperar esses dados apenas decodificando o token depois
        refresh['user_id'] = user_id
        refresh['type'] = tipo_usuario
        refresh['nome'] = nome_encontrado
        refresh['email'] = email_encontrado

        # Retorna a resposta que o Frontend espera
        return Response({
            "access": str(refresh.access_token), # O Token de acesso JWT
            "refresh": str(refresh),             # O Token para renovar (opcional no front agora)
            "type": tipo_usuario,
            "id": user_id,
            "matricula": user_id,
            "nome": nome_encontrado,
            "email": email_encontrado,
            "curso": curso
        }, status=status.HTTP_200_OK)
    

@swagger_auto_schema(method='post', request_body=professor_request_schema)
@api_view(['POST'])
def register_professor(request):
    """
    Rota para cadastro de professor (igual ao aluno, SQL nativo simples).
    """
    data = request.data
    nome = data.get("nome")
    cpf = data.get("cpf")
    email = data.get("email")
    senha = data.get("senha")
    data_nasc = data.get("data_nascimento")
    cod_departamento = data.get("departamento")  # deve ser INT correspondente a DEPARTAMENTO.cod_departamento

    if not all([nome, cpf, email, senha, data_nasc, cod_departamento]):
        return Response({"error": "Todos os campos são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with connection.cursor() as cursor:
            # Checa se CPF já existe
            cursor.execute("SELECT 1 FROM PESSOA WHERE cpf = %s", [cpf])
            if cursor.fetchone():
                return Response({"error": "CPF já cadastrado"}, status=status.HTTP_400_BAD_REQUEST)

            # Insere na tabela PESSOA
            cursor.execute("""
                INSERT INTO PESSOA (cpf, nome, email, data_nascimento, senha)
                VALUES (%s, %s, %s, %s, %s)
            """, [cpf, nome, email, data_nasc, senha])

            # Gera matrícula para professor
            matricula_professor = int(f"{datetime.now().year}{random.randint(100,999)}")
            salario_default = 5000.00  # valor default, você pode mudar

            # Insere na tabela PROFESSOR
            cursor.execute("""
                INSERT INTO PROFESSOR (matricula_professor, salario, fk_cod_departamento, fk_cpf)
                VALUES (%s, %s, %s, %s)
            """, [matricula_professor, salario_default, cod_departamento, cpf])

        return Response({"message": "Professor cadastrado com sucesso!", "matricula": matricula_professor}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
