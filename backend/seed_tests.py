import sqlite3
import json
import os

def seed():
    # Make sure we're in the right directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    
    try:
        c.execute("ALTER TABLE user_test_sessions ADD COLUMN score INTEGER")
        c.execute("ALTER TABLE user_test_sessions ADD COLUMN total INTEGER")
    except sqlite3.OperationalError:
        pass # Columns already exist
        
    dsa_questions = [
        {"question": "Which data structure uses LIFO?", "options": ["Queue", "Stack", "Tree", "Graph"], "correctAnswer": "Stack"},
        {"question": "What is the time complexity of binary search?", "options": ["O(n)", "O(n log n)", "O(log n)", "O(1)"], "correctAnswer": "O(log n)"},
        {"question": "Which sorting algorithm is fastest in worst case?", "options": ["Merge Sort", "Quick Sort", "Bubble Sort", "Insertion Sort"], "correctAnswer": "Merge Sort"},
        {"question": "What is the maximum number of children in a binary tree?", "options": ["1", "2", "3", "Any"], "correctAnswer": "2"},
        {"question": "Which data structure is used for BFS?", "options": ["Stack", "Queue", "Priority Queue", "Linked List"], "correctAnswer": "Queue"},
        {"question": "Which of these is a non-linear data structure?", "options": ["Array", "Linked List", "Stack", "Tree"], "correctAnswer": "Tree"},
        {"question": "What is a full binary tree?", "options": ["Every node has 0 or 2 children", "Every node has 2 children", "All leaves are at same level", "None of above"], "correctAnswer": "Every node has 0 or 2 children"},
        {"question": "Which data structure is used in recursion?", "options": ["Queue", "Stack", "Tree", "Graph"], "correctAnswer": "Stack"},
        {"question": "In a max-heap, where is the largest element?", "options": ["Root", "Leaf", "Left child", "Right child"], "correctAnswer": "Root"},
        {"question": "What is the worst-case time complexity of Quick Sort?", "options": ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], "correctAnswer": "O(n^2)"}
    ]
    
    oop_questions = [
        {"question": "What is encapsulation?", "options": ["Data hiding", "Inheriting attributes", "Polymorphism", "Code reusability"], "correctAnswer": "Data hiding"},
        {"question": "Which concept allows a class to have multiple methods with the same name?", "options": ["Overloading", "Overriding", "Encapsulation", "Abstraction"], "correctAnswer": "Overloading"},
        {"question": "Which of the following is not an OOPS concept?", "options": ["Encapsulation", "Polymorphism", "Exception", "Abstraction"], "correctAnswer": "Exception"},
        {"question": "What is inheritance?", "options": ["Creating new classes from existing ones", "Hiding data", "Multiple forms", "Creating objects"], "correctAnswer": "Creating new classes from existing ones"},
        {"question": "Which keyword is used to inherit a class in Java/C++?", "options": ["inherits", "extends", "implements", "None"], "correctAnswer": "extends"},
        {"question": "What is an abstract class?", "options": ["A class that cannot be instantiated", "A class without methods", "A class without properties", "A class with all public members"], "correctAnswer": "A class that cannot be instantiated"},
        {"question": "Which principle suggests a child class should be substitutable for its base class?", "options": ["Liskov Substitution", "Open/Closed", "Single Responsibility", "Interface Segregation"], "correctAnswer": "Liskov Substitution"},
        {"question": "What is polymorphism?", "options": ["One name many forms", "Data hiding", "Code reuse", "Object creation"], "correctAnswer": "One name many forms"},
        {"question": "Which of these cannot be overloaded?", "options": ["Methods", "Constructors", "Operators", "Destructors"], "correctAnswer": "Destructors"},
        {"question": "A class is a ...", "options": ["Blueprint", "Object", "Variable", "Method"], "correctAnswer": "Blueprint"}
    ]
    
    for test_code, questions, timer in [("DSA101", dsa_questions, 10), ("OOP101", oop_questions, 10)]:
        c.execute("SELECT * FROM tests WHERE test_code = ?", (test_code,))
        if not c.fetchone():
            c.execute('INSERT INTO tests (test_code, questions, timer, is_test_started) VALUES (?, ?, ?, ?)',
                      (test_code, json.dumps(questions), timer, False))
            print(f"Created {test_code}")
        else:
            c.execute('UPDATE tests SET questions = ?, timer = ? WHERE test_code = ?',
                      (json.dumps(questions), timer, test_code))
            print(f"Updated {test_code}")
                      
    conn.commit()
    conn.close()

if __name__ == '__main__':
    seed()
