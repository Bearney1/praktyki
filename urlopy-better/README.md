# Jak wystartować dockera?

1. Zainstaluj dockera
2. Zainstaluj docker-compose
3. W katalogu z projektem uruchom komendę `docker-compose up -d`
4. Uruchom następnie komendę `docker compose exec next npx prisma db push`
5. Strona powinna działać ale trzeba dodać pierwszy projekt
6. Uruchom komendę `docker compose exec next npx prisma studio`
7. Dodaj projekt
8. Wyłącz studio
9. Strona powinna działać -> można usunąć port 5555 z docker file
