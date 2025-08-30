import sqlite3
import os

def create_feedback_table():
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the database file
    db_path = os.path.join(current_dir, 'smartdoc.db')
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create the feedback table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedback (
        feedback_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        answer_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        feedback_type TEXT NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Create indexes for faster queries
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_feedback_answer_id ON feedback(answer_id)')
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("Feedback table created successfully.")

if __name__ == "__main__":
    create_feedback_table()