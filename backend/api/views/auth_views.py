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
    email = request.data.get('email')
    senha = request.data.get('senha')

    with connection.cursor() as cursor:
        # Busca na tabela PESSOA
        sql = "SELECT cpf, nome, email FROM PESSOA WHERE email = %s AND senha = %s"
        cursor.execute(sql, [email, senha])
        pessoa = cursor.fetchone()

        if not pessoa:
            return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        
        cpf = pessoa[0]
        nome = pessoa[1]
        email = pessoa[2]

        # --- PRIMEIRO VERIFICA SE É PROFESSOR ---
        cursor.execute("SELECT matricula_professor FROM PROFESSOR WHERE fk_cpf = %s", [cpf])
        professor = cursor.fetchone()

        if professor:
            tipo = "professor"
            user_id = professor[0]
            curso = None
        else:
            # --- SE NÃO FOR PROFESSOR, VERIFICA SE É ALUNO ---
            cursor.execute("SELECT matricula_aluno, curso FROM ALUNO WHERE fk_cpf = %s", [cpf])
            aluno = cursor.fetchone()

            if aluno:
                tipo = "student"
                user_id = aluno[0]
                curso = aluno[1]
            else:
                tipo = "admin"
                user_id = 0
                curso = None

        # Gera o token
        refresh = RefreshToken()
        refresh["user_id"] = user_id
        refresh["type"] = tipo
        refresh["nome"] = nome
        refresh["email"] = email

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "type": tipo,
            "matricula": user_id,
            "nome": nome,
            "email": email,
            "curso": curso
        })
    

@swagger_auto_schema(method='post', request_body=professor_request_schema)
@api_view(['POST'])
def register_professor(request):
    """
    Cadastra um novo professor usando SQL Nativo (mesma estrutura do aluno).
    """
    data = request.data
    year_prefix = datetime.now().year
    matricula = int(f"{year_prefix}{random.randint(100, 999)}")

    try:
        with connection.cursor() as cursor:
            # 1) INSERE NA TABELA PESSOA
            sql_pessoa = """
                INSERT INTO PESSOA (cpf, nome, email, data_nascimento, senha)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql_pessoa, [
                data['cpf'],
                data['nome'],
                data['email'],
                data['data_nascimento'],
                data['senha']
            ])

            # 2) INSERE NA TABELA PROFESSOR
            sql_professor = """
                INSERT INTO PROFESSOR (matricula_professor, salario, fk_cod_departamento, fk_cpf)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_professor, [
                matricula,
                5000.00,                 # salário default igual antes
                data['departamento'],    # substitui CURSO por DEPARTAMENTO
                data['cpf']
            ])

        return Response({
            "message": "Professor cadastrado!",
            "matricula": matricula
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
