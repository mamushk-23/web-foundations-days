-- 1. CREATE TABLE statements
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT
);

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(student_id, course_id) -- Prevents the same student enrolling on the same course twice
);

-- 2. INSERT statements (3 students, 3 courses, 5 enrolments)
INSERT INTO students (name, email) VALUES 
('Alice Smith', 'alice@example.com'),
('Bob Johnson', 'bob@example.com'),
('Charlie Brown', 'charlie@example.com');

INSERT INTO courses (title, description) VALUES 
('Introduction to Web Development', 'Learn HTML, CSS, and JS'),
('Database Design', 'Learn SQL and data modeling'),
('Data Structures', 'Learn algorithms and data structures');

INSERT INTO enrolments (student_id, course_id, grade) VALUES 
(1, 1, 'A'),    -- Alice in Web Dev
(1, 2, 'B'),    -- Alice in Database Design
(2, 1, 'A-'),   -- Bob in Web Dev
(2, 3, 'C'),    -- Bob in Data Structures
(3, 2, 'B+');   -- Charlie in Database Design

-- 3. FIVE REQUIRED QUERIES

-- Query 1: All courses for one student (by name)
SELECT c.title 
FROM courses c
JOIN enrolments e ON c.id = e.course_id
JOIN students s ON e.student_id = s.id
WHERE s.name = 'Alice Smith';

-- Query 2: All students on one course
SELECT s.name 
FROM students s
JOIN enrolments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE c.title = 'Database Design';

-- Query 3: The number of students per course
SELECT c.title, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON c.id = e.course_id
GROUP BY c.id;

-- Query 4: Students who have no enrolments
SELECT s.name 
FROM students s
LEFT JOIN enrolments e ON s.id = e.student_id
WHERE e.student_id IS NULL;

-- Query 5: Update one enrolment's grade
UPDATE enrolments 
SET grade = 'A+' 
WHERE student_id = 3 AND course_id = 2;