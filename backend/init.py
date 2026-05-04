import sqlite3

# Create a new SQLite database (or connect to an existing one)
conn = sqlite3.connect('users.db')

# Create a new SQLite cursor
cursor = conn.cursor()

# Create a new table with the name 'users'
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password BLOB NOT NULL,
    salt BLOB NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'user'))
)
''')

# Commit the changes and close the connection
conn.commit()
conn.close()

print("Database and users table created successfully.")
