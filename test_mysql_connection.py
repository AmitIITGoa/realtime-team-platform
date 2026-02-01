import mysql.connector
from mysql.connector import Error

def test_mysql_connection():
    """Test MySQL connection with the provided credentials"""
    
    # Connection parameters
    config = {
        'host': '127.0.0.1',
        'port': 3306,
        'user': 'root',
        'password': 'QandAamit'
    }
    
    connection = None
    
    try:
        print("Attempting to connect to MySQL...")
        print(f"Host: {config['host']}")
        print(f"Port: {config['port']}")
        print(f"User: {config['user']}")
        print("-" * 50)
        
        # Establish connection
        connection = mysql.connector.connect(**config)
        
        if connection.is_connected():
            db_info = connection.get_server_info()
            print("✓ Successfully connected to MySQL Server")
            print(f"✓ MySQL Server version: {db_info}")
            
            # Get cursor and execute a simple query
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            record = cursor.fetchone()
            print(f"✓ Current database: {record[0] if record[0] else 'None (no database selected)'}")
            
            # List all databases
            cursor.execute("SHOW DATABASES;")
            databases = cursor.fetchall()
            print(f"✓ Available databases:")
            for db in databases:
                print(f"  - {db[0]}")
            
            cursor.close()
            print("\n✓ Connection test PASSED!")
            return True
            
    except Error as e:
        print(f"✗ Error connecting to MySQL: {e}")
        print("\n✗ Connection test FAILED!")
        return False
        
    finally:
        if connection and connection.is_connected():
            connection.close()
            print("\nConnection closed.")

if __name__ == "__main__":
    test_mysql_connection()
