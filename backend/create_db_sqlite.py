import sqlite3

conn = sqlite3.connect('exam_tool.db')
cursor = conn.cursor()

# Create the 'users' table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user'))
)
            
''')

conn.commit()
conn.close()

print("Database and users table created successfully!")
