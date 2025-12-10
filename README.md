# Integrated Academic Management System (SIGA)

## Project Overview

This project implements a full-stack integrated management system designed for academic institutions, developed to demonstrate deep knowledge of relational database modeling and advanced data manipulation using native SQL. The system supports core academic operations, including user authentication, class registration, grade management (digital ledger), and complex analytical reporting for professors.

## 1. Technologies and Architecture

| Component | Technology | Detail |
| :--- | :--- | :--- |
| **Backend / API** | Django REST Framework (Python) | Handles routing, business logic, and database interaction using raw SQL. |
| **Database (DB)** | PostgreSQL / SQLite | Relational model covering all required relationships (1:1, 1:N, N:N, Ternary). |
| **DB Language** | Native SQL | Focus on efficiency and complexity in data manipulation and querying. |
| **Frontend** | React (TypeScript) | Provides modern user interfaces for Students and Professors. |

## 2. Database Structure and Integrity

The relational schema was strictly designed to enforce integrity and meet all assignment constraints:

* **Relationships:** Includes mandatory 1:1, 1:N, and N:N relationships. The N:N relationship is implemented via the `MATRICULA` associative entity.
* **Data Archiving (Trigger):** Implemented `AFTER DELETE` triggers (`salvar_aluno_excluido` / `salvar_professor_excluido`) to archive user data, fulfilling the trigger requirement.
* **Integrity Constraints:** All relations are mapped with Primary/Foreign Keys and cardinal restrictions. Default values are used (e.g., `PESSOA.saldo`, `TURMA.capacidade`).

## 3. Advanced SQL Querying (Relational Calculus)

This section highlights the complex SQL techniques used in the core API views to meet the advanced query requirements.

| Feature | Technical Implementation | View/Description |
| :--- | :--- | :--- |
| **Quantifier (ALL)** | `WHERE G1.nota >= ALL (SELECT G2.nota...)` | `listar_alunos_excepcionais_professor`. Identifies students with the highest recorded score in a class (Top 1 / ties), demonstrating **Relational Calculus** comparison. |
| **Grouping Filter (HAVING)** | `GROUP BY ... HAVING MAX(AV.nota) IS NOT NULL` | `get_professor_reports`. Filters the data after aggregation, showing only groups (disciplines/students) that have valid grades available, satisfying the `HAVING` requirement. |
| **Pivoting / Multi-Field Aggr.** | `MAX(CASE WHEN AV.id_avaliacao = 'N1' THEN AV.nota ELSE NULL END)` | `get_student_grades`. Used with `GROUP BY` to convert grade rows (N1, N2) into horizontal columns, essential for generating transcripts.
| **Mass Manipulation (CRUD)** | Atomic `for` loop executing multiple `UPDATE/INSERT` SQL statements per transaction. | `salvar_notas_diario`. Processes an entire class roster update (grades and attendance) ensuring transactional integrity.

## 4. Frontend and Data Flow

The frontend application provides two distinct user experiences and uses React features to efficiently consume the API.

### 4.1 Student Dashboard Features

* **Academic Transcript (Boletim):** Displays grades (N1, N2), calculated average, and academic status (Approved, Reproved, Final, Reproved by Absence). This relies on the **Pivoting SQL Query** for accurate display.
* **Historical View:** Shows enrollment history grouped and ordered by semester.
* **RU Management:** Allows students to view their current balance and purchase new tickets.

### 4.2 Professor Dashboard Features

* [cite_start]**Digital Ledger (Diário de Classe):** Fetches the class roster using multi-join queries[cite: 18, 20]. [cite_start]Allows bulk entry of grades and attendance [cite: 26][cite_start], utilizing the **Mass Manipulation** logic (`salvar_notas_diario`)[cite: 26].
* **Advanced Reports:** Displays key performance indicators (KPIs) like Total Students and Approval Rate. [cite_start]The data is driven by the complex **HAVING** and **Grouping** SQL queries[cite: 152, 149].
* [cite_start]**Exceptional Students View:** Uses the **Quantifier (ALL)** route to showcase students with peak academic performance[cite: 35].

## 5. Setup and Run

### 5.1 Backend Setup (Python/Django)

1.  **Dependencies:** Ensure all libraries listed in `requirements.txt` are installed.
2.  **Database Migration:** Execute the complete SQL script provided in the documentation to create the database structure, triggers, and load the initial test data.
3.  **Run Server:**
    ```bash
    python manage.py runserver
    ```
    The API will be available at `http://127.0.0.1:8000/`.

### 5.2 Frontend Setup (React/TypeScript)

1.  **Navigate:** Change directory to the frontend folder.
2.  **Install:** Install dependencies using npm or yarn.
    ```bash
    npm install
    ```
3.  **Run Application:** Start the React development server.
    ```bash
    npm run dev
    ```
    The frontend will typically open at `http://localhost:3000/`.

### 5.3 Key Endpoints Demonstrated

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/professores/<int:matricula>/reports/` | [cite_start]**HAVING**, Grouping (KPIs) [cite: 152] |
| **GET** | `/api/professores/<int:matricula>/alunos-excepcionais/` | [cite_start]**Quantifier ALL** (Relational Calculus) [cite: 35] |
| **POST** | `/api/turma/<str:turma>/<int:disc>/salvar/` | [cite_start]**Mass Manipulation** / Transactional UPSERT [cite: 26] |
| **GET** | `/api/aluno/<int:matricula>/grades/` | [cite_start]Academic Transcript (Boletim) using Pivoting (**CASE WHEN**) [cite: 83, 84] |
| **DELETE** | `/api/professor/<int:matricula>/delete/` | [cite_start]**Trigger Activation**, Transactional Cascade Logic [cite: 147] |
