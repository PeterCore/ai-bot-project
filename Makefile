build: 
	rm -rf dist && npm run build && docker-compose up -d --build
