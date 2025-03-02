import mysql.connector
from decimal import Decimal

# Database configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "zaid",
    "database": "EventManageDB",
    "auth_plugin": "mysql_native_password"
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Helper function to convert Decimal values
def convert_decimal_to_float(data):
    if isinstance(data, list):
        return [convert_decimal_to_float(item) for item in data]
    elif isinstance(data, dict):
        return {k: float(v) if isinstance(v, Decimal) else v for k, v in data.items()}
    return data

# CRUD Operations
def fetch_all(table):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM {table}")
    results = cursor.fetchall()
    conn.close()
    return convert_decimal_to_float(results)

def fetch_by_id(table, id_column, id_value):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM {table} WHERE {id_column} = %s", (id_value,))
    result = cursor.fetchone()
    conn.close()
    return convert_decimal_to_float(result)

def insert(table, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    columns = ", ".join(data.keys())
    values = ", ".join(["%s"] * len(data))
    sql = f"INSERT INTO {table} ({columns}) VALUES ({values})"
    cursor.execute(sql, tuple(data.values()))
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return last_id

def update(table, id_column, id_value, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    updates = ", ".join(f"{k} = %s" for k in data.keys())
    sql = f"UPDATE {table} SET {updates} WHERE {id_column} = %s"
    cursor.execute(sql, (*data.values(), id_value))
    conn.commit()
    affected_rows = cursor.rowcount
    conn.close()
    return affected_rows

def delete(table, id_column, id_value):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM {table} WHERE {id_column} = %s", (id_value,))
    conn.commit()
    affected_rows = cursor.rowcount
    conn.close()
    return affected_rows
