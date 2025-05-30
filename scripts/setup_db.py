from backend.db_utils import create_db_and_tables, load_csv_and_insert

def main():
    create_db_and_tables()
    load_csv_and_insert()

if __name__ == "__main__":
    main()