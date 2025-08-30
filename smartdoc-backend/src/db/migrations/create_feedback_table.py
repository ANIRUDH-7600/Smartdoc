import sqlite3
import os
import sys

# Add the project root directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from src.db import get_db_path

def create_feedback_table():
    """Create the feedback table in the database"""
    db_path = get_db_path()
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create the feedback table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedback (
        feedback_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        answer_id TEXT NOT NULL,
        rating INTEGER,
        feedback_type TEXT,
        comment TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create indexes for faster queries
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback (user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_feedback_answer_id ON feedback (answer_id)')
    
    # Commit the changes and close the connection
    conn.commit()
    conn.close()
    
    print("Feedback table created successfully.")

if __name__ == "__main__":
    create_feedback_table()