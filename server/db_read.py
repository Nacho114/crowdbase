import psycopg2

connection = psycopg2.connect(user = "nanarry",
                                password = "nanaRRYhack20",
                                host = "db-crowdbase.cbkzmw7o5c46.eu-central-1.rds.amazonaws.com",
                                port = "5432",
                                database = "postgres")

cursor = connection.cursor()


# using pandas to execute SQL queries

import pandas as pd

sql = """
SELECT "table_name","column_name", "data_type", "table_schema"
FROM INFORMATION_SCHEMA.COLUMNS
WHERE "table_schema" = 'public'
ORDER BY table_name  
"""
pd_obj = pd.read_sql(sql, con=connection)

print(pd_obj)


