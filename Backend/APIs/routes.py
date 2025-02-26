from flask import Flask, request, jsonify
import api

app = Flask(__name__)

@app.route('/<table>', methods=['GET'])
def get_all(table):
    return jsonify(api.fetch_all(table))

@app.route('/<table>/<id_column>/<id_value>', methods=['GET'])
def get_by_id(table, id_column, id_value):
    return jsonify(api.fetch_by_id(table, id_column, id_value))

@app.route('/<table>', methods=['POST'])
def create_record(table):
    data = request.json
    inserted_id = api.insert(table, data)
    return jsonify({"message": "Record added", "id": inserted_id})

@app.route('/<table>/<id_column>/<id_value>', methods=['PUT'])
def update_record(table, id_column, id_value):
    data = request.json
    rows_affected = api.update(table, id_column, id_value, data)
    return jsonify({"message": "Record updated", "rows_affected": rows_affected})

@app.route('/<table>/<id_column>/<id_value>', methods=['DELETE'])
def delete_record(table, id_column, id_value):
    rows_affected = api.delete(table, id_column, id_value)
    return jsonify({"message": "Record deleted", "rows_affected": rows_affected})

if __name__ == '__main__':
    app.run(debug=True)
