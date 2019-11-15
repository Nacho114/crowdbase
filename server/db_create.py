import psycopg2

connection = psycopg2.connect(user = "nanarry",
                                password = "nanaRRYhack20",
                                host = "db-crowdbase.cbkzmw7o5c46.eu-central-1.rds.amazonaws.com",
                                port = "5432",
                                database = "postgres")

cursor = connection.cursor()


#creating table passengers

cursor.execute("""CREATE TABLE survival(
id SERIAL PRIMARY KEY,
survived integer)""")


connection.commit()
